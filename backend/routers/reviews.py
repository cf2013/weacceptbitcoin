from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from services.transaction_monitor import TransactionMonitor

router = APIRouter()
transaction_monitor = TransactionMonitor()

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

@router.get("/store/{store_id}", response_model=List[schemas.ReviewResponse])
async def list_store_reviews(
    store_id: str,
    skip: int = 0,
    limit: int = 100,
    verified_only: bool = False,
    db: Session = Depends(get_db)
):
    """List all reviews for a specific store."""
    query = db.query(models.Review).filter(models.Review.store_id == store_id)
    if verified_only:
        query = query.filter(models.Review.verified == True)
    reviews = query.offset(skip).limit(limit).all()
    return reviews

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