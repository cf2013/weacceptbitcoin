import os
import secrets
import base64
import json
import time
from typing import Dict, Optional, Tuple
import lnurl
from lnurl import Lnurl
import ecdsa
from ecdsa import VerifyingKey, SECP256k1
import qrcode
from io import BytesIO
import base64
from dotenv import load_dotenv

load_dotenv()

class LnurlAuthService:
    _instance = None
    _initialized = False

    def __new__(cls, domain: Optional[str] = None):
        if cls._instance is None:
            cls._instance = super(LnurlAuthService, cls).__new__(cls)
        return cls._instance

    def __init__(self, domain: Optional[str] = None):
        if not self._initialized:
            self.domain = domain or os.getenv("DOMAIN", "localhost")
            self.tag = "login"
            self.action = "login"
            self.challenges = {}  # Store challenges with expiration time
            self._initialized = True
            print("Initialized LnurlAuthService with domain:", self.domain)

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
        print(f"Generated new challenge k1: {k1}")
        print(f"Challenge length: {len(k1)} characters ({len(bytes.fromhex(k1))} bytes)")
        
        # Create the LNURL
        lnurl_str = f"https://{self.domain}/api/auth/lnurl/callback?tag={self.tag}&k1={k1}&action={self.action}"
        # Remove any double https:// if present
        lnurl_str = lnurl_str.replace("https://https://", "https://")
        print(f"Generated LNURL: {lnurl_str}")
        lnurl_encoded = lnurl.encode(lnurl_str)
        print(f"Encoded LNURL: {lnurl_encoded}")
        
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
        print(f"Stored challenge {k1} in challenges. Current challenges: {list(self.challenges.keys())}")
        print(f"Challenge will expire at: {time.ctime(self.challenges[k1]['expires_at'])}")
        
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
        print(f"Verifying signature with k1: {k1}, sig: {sig}, pubkey: {pubkey}")
        print(f"Current challenges: {list(self.challenges.keys())}")
        
        # Check if the challenge exists and hasn't expired
        if k1 not in self.challenges:
            print(f"Challenge {k1} not found in challenges")
            return False
            
        challenge_data = self.challenges[k1]
        if time.time() > challenge_data["expires_at"]:
            # Remove expired challenge
            print(f"Challenge {k1} has expired")
            del self.challenges[k1]
            return False
            
        # Check if the challenge has already been verified
        if challenge_data["verified"]:
            print(f"Challenge {k1} has already been verified")
            return False
            
        try:
            # Convert hex strings to bytes
            k1_bytes = bytes.fromhex(k1)
            sig_bytes = bytes.fromhex(sig)
            pubkey_bytes = bytes.fromhex(pubkey)
            
            print(f"k1 bytes length: {len(k1_bytes)}")
            print(f"sig bytes length: {len(sig_bytes)}")
            print(f"pubkey bytes length: {len(pubkey_bytes)}")
            
            # Decode DER-encoded signature
            # DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
            if sig_bytes[0] != 0x30:
                print("Invalid DER signature format")
                return False
                
            # Get the length of the remaining data
            der_length = sig_bytes[1]
            
            # Extract r
            r_start = 4  # Skip 0x30, length, 0x02, r-length
            r_length = sig_bytes[3]
            r = sig_bytes[r_start:r_start + r_length]
            
            # Extract s
            s_start = r_start + r_length + 2  # Skip r, 0x02, s-length
            s_length = sig_bytes[s_start - 1]
            s = sig_bytes[s_start:s_start + s_length]
            
            # Remove any leading zeros from r and s
            r = r.lstrip(b'\x00')
            s = s.lstrip(b'\x00')
            
            # Pad r and s to 32 bytes if needed
            r = r.rjust(32, b'\x00')
            s = s.rjust(32, b'\x00')
            
            # Create raw signature (64 bytes)
            raw_sig = r + s
            
            print(f"Raw signature length: {len(raw_sig)}")
            print(f"r length: {len(r)}, s length: {len(s)}")
            
            # Create verifying key from the public key
            vk = VerifyingKey.from_string(pubkey_bytes, curve=SECP256k1)
            
            # Verify the signature
            is_valid = vk.verify_digest(raw_sig, k1_bytes)
            print(f"Signature verification result: {is_valid}")
            
            if is_valid:
                # Mark the challenge as verified
                self.challenges[k1]["verified"] = True
                self.challenges[k1]["pubkey"] = pubkey
                print(f"Challenge {k1} verified successfully with pubkey {pubkey}")
            else:
                print(f"Signature verification failed for challenge {k1}")
            
            return is_valid
        except Exception as e:
            print(f"Error verifying signature: {str(e)}")
            import traceback
            print(traceback.format_exc())
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

    def get_challenge_data(self, k1: str) -> Optional[Dict]:
        """
        Get the data for a challenge.
        
        Args:
            k1: The challenge string
            
        Returns:
            The challenge data if it exists and hasn't expired, None otherwise
        """
        if k1 not in self.challenges:
            return None
            
        challenge_data = self.challenges[k1]
        if time.time() > challenge_data["expires_at"]:
            # Remove expired challenge
            del self.challenges[k1]
            return None
            
        return challenge_data 