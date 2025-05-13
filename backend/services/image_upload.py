import os
from typing import Optional
import requests
from dotenv import load_dotenv
import mimetypes

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

# Headers for Supabase Storage API
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
}

def upload_image(file_data: bytes, file_name: str, store_id: str, image_type: str) -> Optional[str]:
    """
    Upload an image to Supabase Storage.
    
    Args:
        file_data: The image file data in bytes
        file_name: The name of the file
        store_id: The ID of the store
        image_type: Either 'banner' or 'profile'
    
    Returns:
        The public URL of the uploaded image or None if upload failed
    """
    try:
        # Create the path for the image
        path = f"stores/{store_id}/{image_type}/{file_name}"
        
        # Get the content type
        content_type = mimetypes.guess_type(file_name)[0] or 'application/octet-stream'
        
        # Add content type to headers
        upload_headers = {
            **headers,
            'Content-Type': content_type,
        }
        
        print(f"Uploading image to path: {path}")
        print(f"Using content type: {content_type}")
        
        # Upload the file to Supabase Storage
        response = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/store-images/{path}",
            headers=upload_headers,
            data=file_data
        )
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response: {response.text}")
        
        if response.status_code == 200:
            # Return the public URL
            return f"{SUPABASE_URL}/storage/v1/object/public/store-images/{path}"
        else:
            print(f"Failed to upload image: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return None

def delete_image(image_url: str) -> bool:
    """
    Delete an image from Supabase Storage.
    
    Args:
        image_url: The URL of the image to delete
    
    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        # Extract the path from the URL
        path = image_url.split('/public/')[-1]
        
        print(f"Deleting image at path: {path}")
        
        # Delete the file from Supabase Storage
        response = requests.delete(
            f"{SUPABASE_URL}/storage/v1/object/store-images/{path}",
            headers=headers
        )
        
        print(f"Delete response status: {response.status_code}")
        print(f"Delete response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return False 