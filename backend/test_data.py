from supabase_client import create_store, create_review

# Test stores data
test_stores = [
    {
        "name": "Bitcoin Coffee Shop",
        "description": "A cozy coffee shop that accepts Bitcoin payments. Enjoy your favorite brew while supporting Bitcoin adoption!",
        "category": "Food & Beverage",
        "btc_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "verified": True
    },
    {
        "name": "Crypto Tech Store",
        "description": "Your one-stop shop for all tech needs. We proudly accept Bitcoin!",
        "category": "Electronics",
        "btc_address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
        "verified": False
    }
]

# Test reviews data
test_reviews = [
    {
        "store_id": "",  # Will be filled after store creation
        "rating": 5,
        "comment": "Great coffee and smooth Bitcoin payment process!",
        "txid": "81b4c832e6c4b7a7b5e0ad626f7f9d9778d3921195c6c476145c5e7e8d0aaa01",
        "verified": False
    },
    {
        "store_id": "",  # Will be filled after store creation
        "rating": 4,
        "comment": "Good selection of tech products and easy Bitcoin payment.",
        "txid": "92c5d2c7e0b4a6b8f3d2e1c9a8b7d6e5f4c3b2a1908070605040302010000ff",
        "verified": False
    }
]

def insert_test_data():
    try:
        # Insert stores
        store_responses = []
        for store in test_stores:
            response = create_store(store)
            if response:
                store_responses.append(response)
                print(f"Created store: {response['name']}")
            else:
                print(f"Failed to create store: {store['name']}")
        
        # Insert reviews with store IDs
        for i, review in enumerate(test_reviews):
            if i < len(store_responses):
                review["store_id"] = store_responses[i]["id"]
                response = create_review(review)
                if response:
                    print(f"Created review for store: {store_responses[i]['name']}")
                else:
                    print(f"Failed to create review for store: {store_responses[i]['name']}")
        
        print("Test data insertion completed!")
        
    except Exception as e:
        print(f"Error inserting test data: {str(e)}")

if __name__ == "__main__":
    insert_test_data() 