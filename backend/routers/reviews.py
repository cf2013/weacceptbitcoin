from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, constr
from services.transaction_monitor import TransactionMonitor
from supabase_client import get_reviews, create_review, get_store

router = APIRouter()
transaction_monitor = TransactionMonitor()

class ReviewBase(BaseModel):
    store_id: str
    rating: int
    comment: Optional[str] = None
    txid: constr(min_length=64, max_length=64)  # Bitcoin transaction ID validation

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: str
    created_at: str
    updated_at: str

@router.post("", response_model=Review)
async def create_new_review(review: ReviewCreate):
    """Create a new review."""
    try:
        # Check if store exists
        store = get_store(review.store_id)
        if not store.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        # Create review
        response = create_review(review.dict())
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/store/{store_id}", response_model=List[Review])
async def list_store_reviews(store_id: str):
    try:
        response = get_reviews(store_id)
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{review_id}", response_model=Review)
async def get_review(review_id: str):
    """Get a specific review by ID."""
    try:
        reviews = get_reviews(None)  # Get all reviews
        review = next((r for r in reviews.data if r["id"] == review_id), None)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{review_id}/verify")
async def verify_review(review_id: str):
    """Verify a review using its associated Bitcoin transaction."""
    try:
        reviews = get_reviews(None)  # Get all reviews
        review = next((r for r in reviews.data if r["id"] == review_id), None)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )

        if review.get("verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review is already verified"
            )

        # Get the store's Bitcoin address
        store = get_store(review["store_id"])
        if not store.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated store not found"
            )

        # Verify the transaction
        is_valid = await transaction_monitor.verify_review_transaction(review["txid"], store.data["btc_address"])
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review transaction"
            )

        # Update review verification status
        # TODO: Add update_review function to supabase_client
        return {"status": "success", "message": "Review verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 