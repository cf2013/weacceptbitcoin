from fastapi import APIRouter, Query
from services.lnurl_auth import LnurlAuthService
import os

router = APIRouter()
lnurl_auth_service = LnurlAuthService(domain=os.getenv("DOMAIN", "localhost"))

@router.get("/auth/lnurl/callback")
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