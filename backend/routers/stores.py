from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, constr, UUID4
from typing import Optional, List
from cosmos_repository import get_store, get_stores, create_store, update_store, get_reviews
from services.bitcoin import verify_transaction
from services.transaction_monitor import TransactionMonitor
from services.image_upload import upload_image, delete_image

router = APIRouter()
transaction_monitor = TransactionMonitor()

class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    btc_address: Optional[constr(min_length=26, max_length=100)] = None
    banner_image_url: Optional[str] = None
    profile_image_url: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class Store(StoreCreate):
    id: str
    verified: bool
    verification_txid: Optional[str] = None
    verification_amount: Optional[int] = None
    created_at: str
    updated_at: str

class VerificationRequest(BaseModel):
    txid: str
    btc_address: str
    verification_amount: Optional[int] = None

@router.get("", response_model=List[Store])
async def list_stores():
    try:
        stores = get_stores()
        if not stores:
            return []
        return stores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[Store])
async def search_stores(
    category: Optional[str] = None,
    verified: Optional[bool] = None,
    limit: int = 10,
    offset: int = 0
):
    """Search stores with filters"""
    try:
        stores = get_stores()
        if not stores:
            return []
        
        # Apply filters
        if category:
            stores = [s for s in stores if s.get('category') == category]
        if verified is not None:
            stores = [s for s in stores if s.get('verified') == verified]
            
        # Apply pagination
        return stores[offset:offset + limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all unique store categories"""
    try:
        stores = get_stores()
        if not stores:
            return []
        categories = set(s.get('category') for s in stores if s.get('category'))
        return list(categories)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{store_id}", response_model=Store)
async def get_store_by_id(store_id: str):
    try:
        # Validate UUID format
        try:
            UUID4(store_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Invalid store ID format")
            
        store = get_store(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
        return store
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify", response_model=dict)
async def verify_store_transaction(verification: VerificationRequest):
    """Verify a store transaction before creating the store."""
    try:
        if not verification.btc_address:
            raise HTTPException(status_code=400, detail="Bitcoin address is required")
            
        # Verify the transaction
        verification_result = verify_transaction(
            txid=verification.txid,
            expected_address=verification.btc_address,
            min_amount=verification.verification_amount or transaction_monitor.get_verification_amount()
        )
        
        if not verification_result['verified']:
            raise HTTPException(
                status_code=400,
                detail=verification_result.get('error', 'Transaction verification failed')
            )
            
        return {
            "status": "success",
            "message": "Transaction verified successfully",
            "txid": verification.txid,
            "amount": verification_result.get('amount')
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=Store)
async def create_store_endpoint(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    btc_address: str = Form(...),
    banner_image: Optional[UploadFile] = File(None),
    profile_image: Optional[UploadFile] = File(None),
    verification_txid: Optional[str] = Form(None),
    verification_amount: Optional[int] = Form(None)
):
    try:
        # Create the store first
        store_data = {
            "name": name,
            "description": description,
            "category": category,
            "website": website,
            "btc_address": btc_address,
            "verified": verification_txid is not None,  # Set verified based on verification_txid
            "verification_txid": verification_txid,
            "verification_amount": verification_amount
        }
        
        store = create_store(store_data)
        if not store:
            raise HTTPException(status_code=400, detail="Failed to create store")
            
        # Upload images if provided
        if banner_image:
            banner_data = await banner_image.read()
            banner_url = upload_image(
                banner_data,
                banner_image.filename,
                store["id"],
                "banner"
            )
            if banner_url:
                store = update_store(store["id"], {"banner_image_url": banner_url})
                
        if profile_image:
            profile_data = await profile_image.read()
            profile_url = upload_image(
                profile_data,
                profile_image.filename,
                store["id"],
                "profile"
            )
            if profile_url:
                store = update_store(store["id"], {"profile_image_url": profile_url})
                
        return store
        
    except Exception as e:
        # If store creation fails, clean up any uploaded images
        if store and "id" in store:
            if store.get("banner_image_url"):
                delete_image(store["banner_image_url"])
            if store.get("profile_image_url"):
                delete_image(store["profile_image_url"])
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{store_id}", response_model=Store)
async def update_store_by_id(store_id: str, store: StoreBase):
    try:
        # First check if store exists
        existing_store = get_store(store_id)
        if not existing_store:
            raise HTTPException(status_code=404, detail="Store not found")
        
        update_data = store.model_dump(exclude_unset=True)
        response = update_store(store_id, update_data)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to update store")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{store_id}/verify", response_model=Store)
async def verify_store(store_id: str, verification: VerificationRequest):
    """Verify a store using Bitcoin transaction"""
    try:
        store = get_store(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        if not store.get('btc_address'):
            raise HTTPException(status_code=400, detail="Store has no Bitcoin address")
            
        if not store.get('verification_amount'):
            raise HTTPException(status_code=400, detail="Store has no verification amount set")
            
        # Verify the transaction
        verification_result = verify_transaction(
            txid=verification.txid,
            expected_address=store['btc_address'],
            min_amount=store['verification_amount']
        )
        
        if not verification_result['verified']:
            raise HTTPException(
                status_code=400,
                detail=verification_result.get('error', 'Transaction verification failed')
            )
            
        # Update store verification status
        update_data = {
            "verified": True,
            "verification_txid": verification.txid,
            "verification_amount": verification_result.get('amount'),
        }
        
        response = update_store(store_id, update_data)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to verify store")
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{store_id}/stats")
async def get_store_stats(store_id: str):
    """Get store statistics"""
    try:
        store = get_store(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        reviews = get_reviews(store_id)
        if not reviews:
            reviews = []
        
        stats = {
            "total_reviews": len(reviews),
            "average_rating": sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0,
            "verified_reviews": len([r for r in reviews if r.get('verified', False)])
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 