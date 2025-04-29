import os
import secrets
import base64
import json
import time
from typing import Dict, Optional, Tuple
import lnurl
from lnurl import LnurlAuthResponse
from coincurve import PrivateKey, PublicKey
import qrcode
from io import BytesIO
import base64
from dotenv import load_dotenv

load_dotenv()

class LnurlAuthService:
    def __init__(self, domain: Optional[str] = None):
        """
        Initialize the LNURL-auth service.
        
        Args:
            domain: The domain name of the application (e.g., 'weacceptbitcoin.com')
        """
        self.domain = domain or os.getenv("DOMAIN", "localhost")
        self.tag = "login"
        self.action = "login"
        self.challenges = {}  # Store challenges with expiration time
        
    def generate_challenge(self) -> Tuple[str, str, str]:
        """
        Generate a new LNURL-auth challenge.
        
        Returns:
            Tuple containing:
            - k1: The challenge string
            - lnurl: The encoded LNURL string
            - qr_code: Base64-encoded PNG image of the QR code
        """
        # Generate a random 32-byte challenge
        k1 = os.urandom(32).hex()
        
        # Create the LNURL
        lnurl_encoded = lnurl.encode(f"https://{self.domain}/api/auth/lnurl/callback?tag={self.tag}&k1={k1}&action={self.action}")
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(lnurl_encoded)
        qr.make(fit=True)
        
        # Convert QR code to base64
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()
        
        # Store the challenge with a 5-minute expiration
        self.challenges[k1] = {
            "created_at": time.time(),
            "expires_at": time.time() + 300,  # 5 minutes
            "verified": False
        }
        
        return k1, lnurl_encoded, qr_code
    
    def verify_signature(self, k1: str, sig: str, pubkey: str) -> bool:
        """
        Verify the signature of a LNURL-auth challenge.
        
        Args:
            k1: The challenge string
            sig: The signature (hex-encoded)
            pubkey: The public key (hex-encoded)
            
        Returns:
            True if the signature is valid, False otherwise
        """
        # Check if the challenge exists and hasn't expired
        if k1 not in self.challenges:
            return False
            
        challenge_data = self.challenges[k1]
        if time.time() > challenge_data["expires_at"]:
            # Remove expired challenge
            del self.challenges[k1]
            return False
            
        # Check if the challenge has already been verified
        if challenge_data["verified"]:
            return False
            
        try:
            # Convert hex strings to bytes
            k1_bytes = bytes.fromhex(k1)
            sig_bytes = bytes.fromhex(sig)
            pubkey_bytes = bytes.fromhex(pubkey)
            
            # Create PublicKey object
            public_key = PublicKey(pubkey_bytes)
            
            # Verify the signature
            return public_key.verify(sig_bytes, k1_bytes)
        except Exception as e:
            print(f"Error verifying signature: {str(e)}")
            return False
    
    def get_pubkey_from_challenge(self, k1: str) -> Optional[str]:
        """
        Get the public key associated with a verified challenge.
        
        Args:
            k1: The challenge string
            
        Returns:
            The public key if the challenge is verified, None otherwise
        """
        if k1 in self.challenges and self.challenges[k1]["verified"]:
            return self.challenges[k1].get("pubkey")
        return None 