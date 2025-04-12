from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, constr
from typing import Optional, List
from supabase_client import get_store, get_stores, create_store, update_store

router = APIRouter()

class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    btc_address: constr(min_length=26, max_length=100)  # Bitcoin address validation

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    id: str
    verified: bool
    created_at: str
    updated_at: str

@router.get("", response_model=List[Store])
async def list_stores():
    try:
        response = get_stores()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{store_id}", response_model=Store)
async def get_store_by_id(store_id: str):
    try:
        response = get_store(store_id)
        if not response.data:
            raise HTTPException(status_code=404, detail="Store not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=Store)
async def create_new_store(store: StoreCreate):
    try:
        response = create_store(store.dict())
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{store_id}", response_model=Store)
async def update_store_by_id(store_id: str, store: StoreBase):
    try:
        # First check if store exists
        existing_store = get_store(store_id)
        if not existing_store.data:
            raise HTTPException(status_code=404, detail="Store not found")
        
        response = update_store(store_id, store.dict(exclude_unset=True))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 