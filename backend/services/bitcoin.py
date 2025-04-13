import os
import requests
from typing import Optional, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MEMPOOL_API_URL = os.getenv('MEMPOOL_API_URL', 'https://mempool.space/api')

def verify_transaction(txid: str, expected_address: str, min_amount: int = 5000) -> Dict:
    """
    Verify a Bitcoin transaction using Mempool.space API.
    
    Args:
        txid: The transaction ID to verify
        expected_address: The Bitcoin address that should receive the payment
        min_amount: Minimum amount in sats required for verification (default: 5000)
    
    Returns:
        Dict containing verification status and details
    """
    try:
        # Get transaction details
        response = requests.get(f"{MEMPOOL_API_URL}/tx/{txid}")
        response.raise_for_status()
        tx_data = response.json()
        
        # Check if transaction is confirmed
        if not tx_data.get('status', {}).get('confirmed'):
            return {
                'verified': False,
                'error': 'Transaction not confirmed yet'
            }
        
        # Check outputs for the expected address and amount
        for output in tx_data.get('vout', []):
            if output.get('scriptpubkey_address') == expected_address:
                amount = output.get('value', 0)
                if amount >= min_amount:
                    return {
                        'verified': True,
                        'amount': amount
                    }
        
        return {
            'verified': False,
            'error': 'No matching output found for the expected address'
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'verified': False,
            'error': f'Error verifying transaction: {str(e)}'
        }
    except Exception as e:
        return {
            'verified': False,
            'error': f'Unexpected error: {str(e)}'
        } 