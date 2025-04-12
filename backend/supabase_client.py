import os
import requests
from typing import Dict, List, Optional, Any, Union
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

def handle_response(response: requests.Response) -> Union[List[Dict], Dict, None]:
    """Handle the API response and raise exceptions for errors."""
    try:
        response.raise_for_status()
        data = response.json()
        
        # If the response is a list, return it directly
        if isinstance(data, list):
            return data
            
        # If it's a single object, return it
        if isinstance(data, dict):
            return data
            
        # If it's something else, return None
        return None
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        print(f"Response content: {response.text}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_stores() -> List[Dict]:
    """Get all stores from the database."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/stores?select=*",
        headers=headers
    )
    result = handle_response(response)
    return result if isinstance(result, list) else []

def get_store(store_id: str) -> Optional[Dict]:
    """Get a specific store by ID."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/stores?id=eq.{store_id}&select=*",
        headers=headers
    )
    result = handle_response(response)
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return None

def create_store(store_data: Dict) -> Optional[Dict]:
    """Create a new store."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/stores",
        headers=headers,
        json=store_data
    )
    result = handle_response(response)
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return result if isinstance(result, dict) else None

def update_store(store_id: str, update_data: Dict) -> Optional[Dict]:
    """Update a store by ID."""
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/stores?id=eq.{store_id}",
        headers=headers,
        json=update_data
    )
    result = handle_response(response)
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return result if isinstance(result, dict) else None

def get_reviews(store_id: str) -> List[Dict]:
    """Get all reviews for a specific store."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/reviews?store_id=eq.{store_id}&select=*",
        headers=headers
    )
    result = handle_response(response)
    return result if isinstance(result, list) else []

def create_review(review_data: Dict) -> Optional[Dict]:
    """Create a new review."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/reviews",
        headers=headers,
        json=review_data
    )
    result = handle_response(response)
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return result if isinstance(result, dict) else None 