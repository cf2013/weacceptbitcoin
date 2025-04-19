import os
from dotenv import load_dotenv
from supabase_client import get_stores, get_store, create_store, update_store, get_reviews, create_review
import requests

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
            "txid": "a1b2c3d4e5f6g7h8i9j0"
        }
        created_review = create_review(review_data)
        print(f"Created review: {created_review}")
        
        # Test get_reviews
        print("\nTesting get_reviews():")
        reviews = get_reviews(store_id)
        print(f"Found {len(reviews)} reviews for store {store_id}")

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

# Headers for Supabase REST API
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def test_get_reviews():
    """Test getting reviews from Supabase."""
    store_id = "0f603e72-af32-4acd-9161-d5f7e4e80cd3"  # Microstrategy's ID
    url = f"{SUPABASE_URL}/rest/v1/reviews?store_id=eq.{store_id}"
    
    print(f"Fetching reviews from URL: {url}")
    print(f"Using headers: {headers}")
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        print(f"Exception in test_get_reviews: {str(e)}")
        return None

if __name__ == "__main__":
    main()
    reviews = test_get_reviews()
    print("\nReviews:", reviews) 