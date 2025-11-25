import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from services.bitcoin import verify_transaction
from cosmos_repository import get_store, update_store

client = TestClient(app)

# Test data
MOCK_STORE = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Test Store",
    "description": "A test store",
    "category": "Test Category",
    "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "verified": False,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}

MOCK_VERIFICATION_SUCCESS = {
    "verified": True,
    "amount": 10000
}

MOCK_VERIFICATION_FAILURE = {
    "verified": False,
    "error": "Transaction not confirmed yet"
}

@pytest.fixture
def mock_get_store():
    with patch("routers.stores.get_store") as mock:
        mock.return_value = MOCK_STORE
        yield mock

@pytest.fixture
def mock_verify_transaction():
    with patch("routers.stores.verify_transaction") as mock:
        yield mock

@pytest.fixture
def mock_update_store():
    with patch("routers.stores.update_store") as mock:
        mock.return_value = {**MOCK_STORE, "verified": True, "verification_txid": "test_txid", "verification_amount": 10000}
        yield mock

def test_verify_store_success(mock_get_store, mock_verify_transaction, mock_update_store):
    """Test successful store verification"""
    mock_verify_transaction.return_value = MOCK_VERIFICATION_SUCCESS
    
    response = client.post(
        f"/api/stores/{MOCK_STORE['id']}/verify",
        json={"txid": "test_txid"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert data["verification_txid"] == "test_txid"
    assert data["verification_amount"] == 10000
    
    # Verify the correct functions were called
    mock_get_store.assert_called_once_with(MOCK_STORE['id'])
    mock_verify_transaction.assert_called_once_with(
        txid="test_txid",
        expected_address=MOCK_STORE['btc_address']
    )
    mock_update_store.assert_called_once()

def test_verify_store_not_found(mock_get_store, mock_verify_transaction):
    """Test verification of non-existent store"""
    mock_get_store.return_value = None
    
    response = client.post(
        "/api/stores/nonexistent-id/verify",
        json={"txid": "test_txid"}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Store not found"

def test_verify_store_no_btc_address(mock_get_store, mock_verify_transaction):
    """Test verification of store without Bitcoin address"""
    mock_store_no_btc = {**MOCK_STORE, "btc_address": None}
    mock_get_store.return_value = mock_store_no_btc
    
    response = client.post(
        f"/api/stores/{MOCK_STORE['id']}/verify",
        json={"txid": "test_txid"}
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Store has no Bitcoin address"

def test_verify_store_transaction_not_confirmed(mock_get_store, mock_verify_transaction):
    """Test verification with unconfirmed transaction"""
    mock_verify_transaction.return_value = MOCK_VERIFICATION_FAILURE
    
    response = client.post(
        f"/api/stores/{MOCK_STORE['id']}/verify",
        json={"txid": "test_txid"}
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Transaction not confirmed yet"

def test_verify_store_invalid_txid(mock_get_store, mock_verify_transaction):
    """Test verification with invalid transaction ID"""
    mock_verify_transaction.side_effect = Exception("Invalid transaction ID")
    
    response = client.post(
        f"/api/stores/{MOCK_STORE['id']}/verify",
        json={"txid": "invalid_txid"}
    )
    
    assert response.status_code == 500
    assert "Invalid transaction ID" in response.json()["detail"]

def test_verify_store_update_failure(mock_get_store, mock_verify_transaction, mock_update_store):
    """Test verification when store update fails"""
    mock_verify_transaction.return_value = MOCK_VERIFICATION_SUCCESS
    mock_update_store.return_value = None
    
    response = client.post(
        f"/api/stores/{MOCK_STORE['id']}/verify",
        json={"txid": "test_txid"}
    )
    
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to verify store" 