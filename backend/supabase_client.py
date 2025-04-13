import os
import requests
from typing import Dict, List, Optional, Any, Union
from dotenv import load_dotenv
from dataclasses import dataclass

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

@dataclass
class SupabaseResponse:
    data: Optional[Union[List[Dict], Dict]] = None
    error: Optional[str] = None

# Headers for Supabase REST API
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def handle_response(response: requests.Response) -> SupabaseResponse:
    """Handle the API response and return a consistent response object."""
    try:
        response.raise_for_status()
        data = response.json()
        
        # If the response is a list or dict, wrap it in SupabaseResponse
        if isinstance(data, (list, dict)):
            return SupabaseResponse(data=data)
            
        # If it's something else, return None data
        return SupabaseResponse(data=None)
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        print(f"Response content: {response.text}")
        return SupabaseResponse(error=str(e))
    except Exception as e:
        print(f"Error: {e}")
        return SupabaseResponse(error=str(e))

def get_stores() -> List[Dict]:
    """Get all stores from the database."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/stores?select=*",
        headers=headers
    )
    result = handle_response(response)
    return result.data if isinstance(result.data, list) else []

def get_store(store_id: str) -> Optional[Dict]:
    """Get a specific store by ID."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/stores?id=eq.{store_id}&select=*",
        headers=headers
    )
    result = handle_response(response)
    if isinstance(result.data, list) and len(result.data) > 0:
        return result.data[0]
    return None

def create_store(store_data: Dict) -> Optional[Dict]:
    """Create a new store."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/stores",
        headers=headers,
        json=store_data
    )
    result = handle_response(response)
    if isinstance(result.data, list) and len(result.data) > 0:
        return result.data[0]
    return result.data if isinstance(result.data, dict) else None

def update_store(store_id: str, update_data: Dict) -> Optional[Dict]:
    """Update a store by ID."""
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/stores?id=eq.{store_id}",
        headers=headers,
        json=update_data
    )
    result = handle_response(response)
    if isinstance(result.data, list) and len(result.data) > 0:
        return result.data[0]
    return result.data if isinstance(result.data, dict) else None

def get_reviews(store_id: str) -> List[Dict]:
    """Get all reviews for a specific store."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/reviews?store_id=eq.{store_id}&select=*",
        headers=headers
    )
    result = handle_response(response)
    return result.data if isinstance(result.data, list) else []

def create_review(review_data: Dict) -> Optional[Dict]:
    """Create a new review."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/reviews",
        headers=headers,
        json=review_data
    )
    result = handle_response(response)
    if isinstance(result.data, list) and len(result.data) > 0:
        return result.data[0]
    return result.data if isinstance(result.data, dict) else None 