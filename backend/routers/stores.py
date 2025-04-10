from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from services.transaction_monitor import TransactionMonitor

router = APIRouter()
transaction_monitor = TransactionMonitor()

@router.post("/", response_model=schemas.StoreResponse)
async def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    """Create a new store entry."""
    db_store = models.Store(**store.model_dump())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

@router.get("/", response_model=List[schemas.StoreResponse])
async def list_stores(
    skip: int = 0,
    limit: int = 100,
    verified_only: bool = False,
    db: Session = Depends(get_db)
):
    """List all stores with optional filtering."""
    query = db.query(models.Store)
    if verified_only:
        query = query.filter(models.Store.verified == True)
    stores = query.offset(skip).limit(limit).all()
    return stores

@router.get("/{store_id}", response_model=schemas.StoreResponse)
async def get_store(store_id: str, db: Session = Depends(get_db)):
    """Get a specific store by ID."""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store

@router.post("/{store_id}/verify")
async def verify_store(
    store_id: str,
    txid: str,
    db: Session = Depends(get_db)
):
    """Verify a store using a Bitcoin transaction."""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    if store.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store is already verified"
        )

    # Verify the transaction
    is_valid = await transaction_monitor.verify_store_transaction(txid, store.btc_address)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification transaction"
        )

    # Update store verification status
    store.verified = True
    store.submitted_txid = txid
    db.commit()
    db.refresh(store)

    return {"status": "success", "message": "Store verified successfully"}

@router.put("/{store_id}", response_model=schemas.StoreResponse)
async def update_store(
    store_id: str,
    store_update: schemas.StoreUpdate,
    db: Session = Depends(get_db)
):
    """Update a store's information."""
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    # Update store fields
    for field, value in store_update.model_dump(exclude_unset=True).items():
        setattr(db_store, field, value)

    db.commit()
    db.refresh(db_store)
    return db_store

@router.delete("/{store_id}")
async def delete_store(store_id: str, db: Session = Depends(get_db)):
    """Delete a store."""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    db.delete(store)
    db.commit()
    return {"status": "success", "message": "Store deleted successfully"} 