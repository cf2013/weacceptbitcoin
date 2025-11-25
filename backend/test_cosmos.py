"""
Test script for CosmosDB integration.
Renamed from test_supabase.py - now tests Azure CosmosDB.
"""
import os
from dotenv import load_dotenv
from cosmos_repository import get_stores, get_store, create_store, update_store, get_reviews, create_review


def main():
    # Load environment variables
    load_dotenv()
    
    # Test get_stores
    print("\nTesting get_stores():")
    stores = get_stores()
    print(f"Found {len(stores)} stores")
    
    # Test create_store
    print("\nTesting create_store():")
    new_store = {
        "name": "Test Store",
        "description": "A test store created via CosmosDB",
        "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    }
    created_store = create_store(new_store)
    print(f"Created store: {created_store}")
    
    if created_store:
        store_id = created_store.get('id')
        
        # Test get_store
        print("\nTesting get_store():")
        store = get_store(store_id)
        print(f"Retrieved store: {store}")
        
        # Test update_store
        print("\nTesting update_store():")
        update_data = {
            "description": "Updated test store description"
        }
        updated_store = update_store(store_id, update_data)
        print(f"Updated store: {updated_store}")
        
        # Test create_review
        print("\nTesting create_review():")
        review_data = {
            "store_id": store_id,
            "rating": 5,
            "comment": "Great test store!",
            "txid": "a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f6g7h8i9j01234"
        }
        created_review = create_review(review_data)
        print(f"Created review: {created_review}")
        
        # Test get_reviews
        print("\nTesting get_reviews():")
        reviews = get_reviews(store_id)
        print(f"Reviews for store {store_id}: {reviews}")


def test_get_reviews_for_store():
    """Test getting reviews for a specific store."""
    load_dotenv()
    store_id = "0f603e72-af32-4acd-9161-d5f7e4e80cd3"  # Example store ID
    
    print(f"\nFetching reviews for store: {store_id}")
    
    try:
        response = get_reviews(store_id)
        print(f"Response: {response}")
        return response.data if response.data else []
    except Exception as e:
        print(f"Exception in test_get_reviews: {str(e)}")
        return None


if __name__ == "__main__":
    main()
    reviews = test_get_reviews_for_store()
    print("\nReviews:", reviews) 