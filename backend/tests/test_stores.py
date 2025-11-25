import pytest
from fastapi.testclient import TestClient
from main import app
from cosmos_repository import create_store, get_store, update_store, get_stores, get_reviews

client = TestClient(app)

# Test data
test_store = {
    "name": "Test Store",
    "description": "A test store",
    "category": "Test Category",
    "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}

@pytest.fixture
def created_store(client, test_store):
    """Create a test store and return its data"""
    response = client.post("/api/stores", json=test_store)
    return response.json()

def test_create_store(client, test_store):
    response = client.post("/api/stores", json=test_store)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_store["name"]
    assert data["description"] == test_store["description"]
    assert data["category"] == test_store["category"]
    assert data["btc_address"] == test_store["btc_address"]
    assert "id" in data
    assert "verified" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_get_store(client, created_store):
    store_id = created_store["id"]
    response = client.get(f"/api/stores/{store_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == store_id
    assert data["name"] == created_store["name"]

def test_get_store_not_found(client):
    response = client.get("/api/stores/nonexistent-id")
    assert response.status_code == 404

def test_list_stores(client):
    response = client.get("/api/stores")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "id" in data[0]
        assert "name" in data[0]

def test_search_stores(client, created_store):
    # Test search with category filter
    response = client.get("/api/stores/search?category=Test Category")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["category"] == "Test Category"
    
    # Test search with verified filter
    response = client.get("/api/stores/search?verified=false")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["verified"] == False

def test_get_categories(client, created_store):
    response = client.get("/api/stores/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "Test Category" in data

def test_update_store(client, created_store):
    store_id = created_store["id"]
    update_data = {
        "name": "Updated Store Name",
        "description": "Updated description"
    }
    response = client.patch(f"/api/stores/{store_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]

def test_verify_store(client, created_store):
    store_id = created_store["id"]
    response = client.post(f"/api/stores/{store_id}/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] == True

def test_get_store_stats(client, created_store):
    store_id = created_store["id"]
    response = client.get(f"/api/stores/{store_id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_reviews" in data
    assert "average_rating" in data
    assert "verified_reviews" in data
    assert isinstance(data["total_reviews"], int)
    assert isinstance(data["average_rating"], (int, float))
    assert isinstance(data["verified_reviews"], int) 