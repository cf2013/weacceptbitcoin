from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from services.transaction_monitor import TransactionMonitor
from pydantic import BaseModel, constr
from supabase_client import get_reviews, create_review

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

@router.post("/", response_model=schemas.ReviewResponse)
async def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    """Create a new review."""
    # Check if store exists
    store = db.query(models.Store).filter(models.Store.id == review.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Create review
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/store/{store_id}", response_model=List[Review])
async def list_store_reviews(store_id: str):
    try:
        response = get_reviews(store_id)
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{review_id}", response_model=schemas.ReviewResponse)
async def get_review(review_id: str, db: Session = Depends(get_db)):
    """Get a specific review by ID."""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    return review

@router.post("/{review_id}/verify")
async def verify_review(
    review_id: str,
    db: Session = Depends(get_db)
):
    """Verify a review using its associated Bitcoin transaction."""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review is already verified"
        )

    # Get the store's Bitcoin address
    store = db.query(models.Store).filter(models.Store.id == review.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated store not found"
        )

    # Verify the transaction
    is_valid = await transaction_monitor.verify_review_transaction(review.txid, store.btc_address)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review transaction"
        )

    # Update review verification status
    review.verified = True
    db.commit()
    db.refresh(review)

    return {"status": "success", "message": "Review verified successfully"}

@router.put("/{review_id}", response_model=schemas.ReviewResponse)
async def update_review(
    review_id: str,
    review_update: schemas.ReviewUpdate,
    db: Session = Depends(get_db)
):
    """Update a review's information."""
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Update review fields
    for field, value in review_update.model_dump(exclude_unset=True).items():
        setattr(db_review, field, value)

    db.commit()
    db.refresh(db_review)
    return db_review

@router.delete("/{review_id}")
async def delete_review(review_id: str, db: Session = Depends(get_db)):
    """Delete a review."""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    db.delete(review)
    db.commit()
    return {"status": "success", "message": "Review deleted successfully"}

@router.post("", response_model=Review)
async def create_new_review(review: ReviewCreate):
    try:
        # TODO: Add transaction verification logic here
        response = create_review(review.dict())
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 