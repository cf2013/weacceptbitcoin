from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, constr, UUID4
from typing import Optional, List
from supabase_client import get_store, get_stores, create_store, update_store, get_reviews

router = APIRouter()

class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    btc_address: Optional[constr(min_length=26, max_length=100)] = None

class StoreCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    btc_address: constr(min_length=26, max_length=100)  # Required for creation

class Store(StoreCreate):
    id: str
    verified: bool
    created_at: str
    updated_at: str

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

@router.post("", response_model=Store)
async def create_new_store(store: StoreCreate):
    try:
        store_data = store.model_dump()
        store_data["verified"] = False  # New stores are unverified by default
        response = create_store(store_data)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to create store")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def verify_store(store_id: str):
    """Verify a store using Bitcoin transaction"""
    try:
        store = get_store(store_id)
        if not store:
            raise HTTPException(status_code=404, detail="Store not found")
            
        # TODO: Add transaction verification logic here
        # For MVP, we can just mark it as verified
        update_data = {"verified": True}
        response = update_store(store_id, update_data)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to verify store")
        return response
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