import aiohttp
import asyncio
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class TransactionMonitor:
    def __init__(self):
        self.mempool_api_url = os.getenv("MEMPOOL_API_URL", "https://mempool.space/api")
        self.verification_amount = 5000  # 5,000 sats minimum for verification

    async def get_transaction(self, txid: str) -> Optional[Dict[str, Any]]:
        """Fetch transaction details from Mempool.space API."""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{self.mempool_api_url}/tx/{txid}") as response:
                    if response.status == 200:
                        return await response.json()
                    return None
            except Exception as e:
                print(f"Error fetching transaction {txid}: {str(e)}")
                return None

    async def verify_store_transaction(self, txid: str, expected_address: str) -> bool:
        """
        Verify that a transaction was sent from the expected Bitcoin address.
        Returns True if the transaction is valid and sent from the expected address.
        """
        tx_data = await self.get_transaction(txid)
        if not tx_data:
            return False

        # Check if any input address matches the expected address
        for vin in tx_data.get("vin", []):
            if vin.get("prevout", {}).get("scriptpubkey_address") == expected_address:
                return True
        return False

    async def verify_review_transaction(self, txid: str, store_address: str) -> bool:
        """
        Verify that a transaction was sent to the store's Bitcoin address.
        Returns True if the transaction is valid and sent to the store's address.
        """
        tx_data = await self.get_transaction(txid)
        if not tx_data:
            return False

        # Check if any output is sent to the store's address with sufficient amount
        for vout in tx_data.get("vout", []):
            if (vout.get("scriptpubkey_address") == store_address and 
                vout.get("value", 0) >= self.verification_amount):
                return True
        return False

    async def monitor_address(self, address: str, callback):
        """
        Monitor an address for new transactions.
        This is a basic implementation that polls the API every 30 seconds.
        In production, you might want to use WebSocket or a more efficient method.
        """
        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.mempool_api_url}/address/{address}/txs") as response:
                        if response.status == 200:
                            transactions = await response.json()
                            for tx in transactions:
                                await callback(tx)
            except Exception as e:
                print(f"Error monitoring address {address}: {str(e)}")
            
            await asyncio.sleep(30)  # Poll every 30 seconds 