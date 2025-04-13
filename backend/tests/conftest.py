import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def test_store():
    """Test store data"""
    return {
        "name": "Test Store",
        "description": "A test store",
        "category": "Test Category",
        "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    }

@pytest.fixture
def test_review():
    """Test review data"""
    return {
        "store_id": "test-store-id",
        "rating": 5,
        "comment": "Great test store!",
        "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
    } 