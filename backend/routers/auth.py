from fastapi import APIRouter, Query
from services.lnurl_auth import LnurlAuthService
import os
from typing import Optional

router = APIRouter()
# Use the singleton instance
lnurl_auth_service = LnurlAuthService(domain=os.getenv("DOMAIN", "localhost"))

@router.get("/api/auth/lnurl/callback")
async def lnurl_auth_callback(
    k1: str = Query(...),
    key: str = Query(...),
    sig: str = Query(...),
    tag: str = Query("login"),
    action: str = Query("login")
):
    # Verify the signature
    is_valid = lnurl_auth_service.verify_signature(k1, sig, key)
    if not is_valid:
        return {"status": "ERROR", "reason": "Invalid signature"}
    return {"status": "OK"}

@router.get("/api/auth/lnurl/status")
async def lnurl_auth_status(k1: str = Query(...)):
    """Check the status of a LNURL-auth challenge."""
    # Get the challenge data
    challenge_data = lnurl_auth_service.get_challenge_data(k1)
    if not challenge_data:
        return {"status": "ERROR", "reason": "Challenge not found or expired"}
    
    if not challenge_data.get("verified"):
        return {"status": "PENDING"}
    
    return {
        "status": "OK",
        "pubkey": challenge_data.get("pubkey")
    }

@router.get("/api/auth/test-signature")
async def test_signature(
    k1: Optional[str] = None,
    sig: Optional[str] = None,
    pubkey: Optional[str] = None
):
    """Test endpoint for signature verification debugging."""
    if not all([k1, sig, pubkey]):
        return {
            "status": "ERROR",
            "reason": "Missing parameters",
            "required": ["k1", "sig", "pubkey"]
        }
    
    try:
        # Convert hex strings to bytes
        k1_bytes = bytes.fromhex(k1)
        sig_bytes = bytes.fromhex(sig)
        pubkey_bytes = bytes.fromhex(pubkey)
        
        return {
            "status": "OK",
            "details": {
                "k1_length": len(k1_bytes),
                "sig_length": len(sig_bytes),
                "pubkey_length": len(pubkey_bytes),
                "k1": k1,
                "sig": sig,
                "pubkey": pubkey
            }
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "reason": str(e)
        }