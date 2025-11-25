import aiohttp
import asyncio
import logging
from typing import Optional, Dict, Any, Callable, List
import os
from dotenv import load_dotenv
import random
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class TransactionMonitor:
    def __init__(self):
        self.mempool_api_url = os.getenv("MEMPOOL_API_URL", "https://mempool.space/api")
        self._monitoring_tasks = {}

    def _generate_verification_amount(self) -> int:
        """Generate a random verification amount between 1000 and 5000 sats."""
        return random.randint(1000, 5000)

    def get_verification_amount(self) -> int:
        """Get a new verification amount for each store."""
        return self._generate_verification_amount()

    async def get_transaction(self, txid: str) -> Optional[Dict[str, Any]]:
        """
        Get transaction details from the Bitcoin API.
        """
        print(f"Fetching transaction details for txid: {txid}")
        url = f"{self.mempool_api_url}/tx/{txid}"
        print(f"API URL: {url}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    print(f"API Response status: {response.status}")
                    if response.status == 200:
                        data = await response.json()
                        print(f"Transaction data received: {data}")
                        return data
                    else:
                        error_text = await response.text()
                        print(f"API Error: Status {response.status}, Response: {error_text}")
                        return None
        except Exception as e:
            print(f"Exception while fetching transaction: {str(e)}")
            return None

    async def verify_store_transaction(self, txid: str, expected_address: str, verification_amount: int) -> Dict[str, Any]:
        """
        Verify that a transaction was sent from the expected Bitcoin address.
        Returns a dictionary with verification status and details.
        """
        print(f"\n=== Starting store transaction verification ===")
        print(f"TXID: {txid}")
        print(f"Expected address: {expected_address}")
        print(f"Required verification amount: {verification_amount} sats")
        
        tx_data = await self.get_transaction(txid)
        if not tx_data:
            print("Transaction data not found")
            return {
                'verified': False,
                'error': 'Transaction not found or invalid'
            }

        # Check if transaction is confirmed
        if not tx_data.get('status', {}).get('confirmed'):
            print("Transaction is not confirmed")
            return {
                'verified': False,
                'error': 'Transaction not confirmed yet'
            }

        print("\nChecking transaction inputs and outputs:")
        # Check if any input address matches the expected address
        for vin in tx_data.get('vin', []):
            input_address = vin.get('prevout', {}).get('scriptpubkey_address')
            print(f"Checking input address: {input_address}")
            if input_address == expected_address:
                print("Found matching input address!")
                amount = sum(vout.get('value', 0) for vout in tx_data.get('vout', []))
                print(f"Total transaction amount: {amount} sats")
                print(f"Required amount: {verification_amount} sats")
                if amount == verification_amount:
                    print("Amount matches exactly! Verification successful")
                    return {
                        'verified': True,
                        'amount': amount,
                        'txid': txid
                    }
                else:
                    print(f"Amount mismatch! Got {amount} sats, expected {verification_amount} sats")
                    return {
                        'verified': False,
                        'error': f'Transaction amount ({amount} sats) must be exactly {verification_amount} sats'
                    }

        print("No matching input address found")
        return {
            'verified': False,
            'error': 'Transaction not sent from the expected address'
        }

    async def verify_review_transaction(self, txid: str, store_address: str, verification_amount: Optional[int] = None) -> Dict[str, Any]:
        """
        Verify that a transaction was sent to the store's Bitcoin address.
        Returns a dictionary with verification status and details.
        """
        print(f"Starting transaction verification for txid: {txid}")
        print(f"Expected store address: {store_address}")
        print(f"Expected verification amount: {verification_amount}")
        
        tx_data = await self.get_transaction(txid)
        if not tx_data:
            print(f"Transaction not found or invalid for txid: {txid}")
            return {
                'verified': False,
                'error': 'Transaction not found or invalid'
            }

        print(f"Transaction data retrieved: {tx_data}")
        
        # Check if transaction is confirmed
        if not tx_data.get('status', {}).get('confirmed'):
            print(f"Transaction {txid} is not confirmed yet")
            return {
                'verified': False,
                'error': 'Transaction not confirmed yet'
            }

        print("Transaction is confirmed, checking outputs...")
        
        # Check if any output is sent to the store's address with sufficient amount
        # for testing purposes we can change if amount >= verification_amount.
        for vout in tx_data.get('vout', []):
            print(f"Checking output: {vout}")
            if vout.get('scriptpubkey_address') == store_address:
                amount = vout.get('value', 0)
                print(f"Found matching output to store address with amount: {amount} sats")
                
                # If verification_amount is provided, check if the amount matches exactly
                if verification_amount is not None:
                    if amount == verification_amount:
                        return {
                            'verified': True,
                            'amount': amount,
                            'txid': txid
                        }
                    else:
                        return {
                            'verified': False,
                            'error': f'Transaction amount ({amount} sats) must be exactly {verification_amount} sats'
                        }
                
                # If no verification_amount is provided, just check if there's a payment to the store address
                return {
                    'verified': True,
                    'amount': amount,
                    'txid': txid
                }

        print(f"No valid payment found to store address: {store_address}")
        return {
            'verified': False,
            'error': 'No valid payment found to the store address'
        }

    async def monitor_address(self, address: str, callback: Callable):
        """
        Monitor an address for new transactions.
        This is a basic implementation that polls the API every 30 seconds.
        In production, you might want to use WebSocket or a more efficient method.
        """
        if address in self._monitoring_tasks:
            logger.warning(f"Already monitoring address {address}")
            return

        async def _monitor():
            last_txid = None
            while True:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(f"{self.mempool_api_url}/address/{address}/txs") as response:
                            if response.status == 200:
                                transactions = await response.json()
                                for tx in transactions:
                                    txid = tx.get('txid')
                                    if txid and txid != last_txid:
                                        last_txid = txid
                                        await callback(tx)
                            else:
                                logger.warning(f"Failed to fetch transactions for {address}: Status {response.status}")
                except aiohttp.ClientError as e:
                    logger.error(f"Network error monitoring address {address}: {str(e)}")
                except Exception as e:
                    logger.error(f"Unexpected error monitoring address {address}: {str(e)}")
                
                await asyncio.sleep(30)  # Poll every 30 seconds

        task = asyncio.create_task(_monitor())
        self._monitoring_tasks[address] = task
        logger.info(f"Started monitoring address {address}")

    def stop_monitoring(self, address: str):
        """Stop monitoring a specific address."""
        if address in self._monitoring_tasks:
            self._monitoring_tasks[address].cancel()
            del self._monitoring_tasks[address]
            logger.info(f"Stopped monitoring address {address}")

    def stop_all_monitoring(self):
        """Stop monitoring all addresses."""
        for address, task in self._monitoring_tasks.items():
            task.cancel()
            logger.info(f"Stopped monitoring address {address}")
        self._monitoring_tasks.clear() 