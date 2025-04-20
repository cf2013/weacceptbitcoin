from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, constr
from services.transaction_monitor import TransactionMonitor
from supabase_client import get_reviews, create_review, get_store, update_review

router = APIRouter()
transaction_monitor = TransactionMonitor()

class ReviewBase(BaseModel):
    store_id: str
    rating: int
    comment: Optional[str] = None
    txid: constr(min_length=64, max_length=64)  # Bitcoin transaction ID validation

class ReviewCreate(ReviewBase):
    pass

class Review(BaseModel):  # Changed from ReviewBase to BaseModel
    id: str
    store_id: str
    rating: int
    comment: Optional[str] = None
    txid: str  # Removed length validation for existing reviews
    created_at: str
    updated_at: str
    verified: bool = False

class VerificationRequest(BaseModel):
    txid: constr(min_length=64, max_length=64)

@router.post("", response_model=Review)
async def create_new_review(review: ReviewCreate):
    """Create a new review."""
    try:
        # Check if store exists
        store = get_store(review.store_id)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        # Create review
        response = create_review(review.dict())
        if response.error:
            raise HTTPException(status_code=500, detail=response.error)
            
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create review")
            
        if isinstance(response.data, list) and len(response.data) > 0:
            return response.data[0]
            
        if isinstance(response.data, dict):
            return response.data
            
        raise HTTPException(status_code=500, detail="Unexpected response format")
    except Exception as e:
        print(f"Exception in create_new_review: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/store/{store_id}", response_model=List[Review])
async def list_store_reviews(store_id: str):
    try:
        print(f"Fetching reviews for store ID: {store_id}")
        response = get_reviews(store_id)
        print(f"Response from get_reviews: {response}")
        
        if response.error:
            print(f"Error in get_reviews: {response.error}")
            raise HTTPException(status_code=500, detail=response.error)
            
        if not response.data:
            print("No reviews found")
            return []
            
        if not isinstance(response.data, list):
            print(f"Unexpected response data type: {type(response.data)}")
            return []
            
        return response.data
    except Exception as e:
        print(f"Exception in list_store_reviews: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{review_id}", response_model=Review)
async def get_review(review_id: str):
    """Get a specific review by ID."""
    try:
        response = get_reviews(None)  # Get all reviews
        if response.error:
            raise HTTPException(status_code=500, detail=response.error)
            
        reviews = response.data if isinstance(response.data, list) else []
        review = next((r for r in reviews if r["id"] == review_id), None)
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify", response_model=dict)
async def verify_review_transaction(store_id: str, verification: VerificationRequest):
    """Verify a review transaction before creating the review."""
    try:
        print(f"Starting review transaction verification for store_id: {store_id}")
        print(f"Verification request data: {verification}")
        
        # Check if store exists
        store = get_store(store_id)
        if not store:
            print(f"Store not found with ID: {store_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )
        
        print(f"Found store with Bitcoin address: {store['btc_address']}")

        # Verify the transaction
        print(f"Calling transaction_monitor.verify_review_transaction with txid: {verification.txid}")
        verification_result = await transaction_monitor.verify_review_transaction(
            verification.txid, 
            store["btc_address"]
        )
        print(f"Verification result: {verification_result}")
        
        if not verification_result.get('verified', False):
            error_msg = verification_result.get('error', 'Invalid review transaction')
            print(f"Verification failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
            
        print("Transaction verified successfully")
        return {
            "status": "success", 
            "message": "Transaction verified successfully",
            "txid": verification.txid
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception in verify_review_transaction: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{review_id}/verify")
async def verify_review(review_id: str):
    """Verify a review using its associated Bitcoin transaction."""
    try:
        response = get_reviews(None)  # Get all reviews
        if response.error:
            raise HTTPException(status_code=500, detail=response.error)
            
        reviews = response.data if isinstance(response.data, list) else []
        review = next((r for r in reviews if r["id"] == review_id), None)
        
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
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated store not found"
            )

        # Verify the transaction
        is_valid = await transaction_monitor.verify_review_transaction(review["txid"], store["btc_address"])
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review transaction"
            )

        # Update review verification status
        update_response = update_review(review_id, {"verified": True})
        if update_response.error:
            raise HTTPException(status_code=500, detail=update_response.error)
            
        return {"status": "success", "message": "Review verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 