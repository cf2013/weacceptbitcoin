import os
from dotenv import load_dotenv
from supabase_client import get_stores, get_store, create_store, update_store, get_reviews, create_review

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
        "description": "A test store created via REST API",
        "website": "https://teststore.com",
        "bitcoin_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
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
            "bitcoin_txid": "a1b2c3d4e5f6g7h8i9j0"
        }
        created_review = create_review(review_data)
        print(f"Created review: {created_review}")
        
        # Test get_reviews
        print("\nTesting get_reviews():")
        reviews = get_reviews(store_id)
        print(f"Found {len(reviews)} reviews for store {store_id}")

if __name__ == "__main__":
    main() 