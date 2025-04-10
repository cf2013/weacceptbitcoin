from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Store Schemas
class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    btc_address: str

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    btc_address: Optional[str] = None

class StoreInDB(StoreBase):
    id: str
    submitted_txid: Optional[str] = None
    verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None
    txid: str

class ReviewCreate(ReviewBase):
    store_id: str

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    text: Optional[str] = None
    txid: Optional[str] = None

class ReviewInDB(ReviewBase):
    id: str
    store_id: str
    verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Response Schemas
class StoreResponse(StoreInDB):
    reviews: List[ReviewInDB] = []

class ReviewResponse(ReviewInDB):
    store: StoreInDB 