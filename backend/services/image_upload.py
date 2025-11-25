import os
from typing import Optional
from dotenv import load_dotenv
import mimetypes

# Load environment variables
load_dotenv()

# Azure Blob Storage configuration
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
AZURE_STORAGE_CONTAINER_NAME = os.getenv('AZURE_STORAGE_CONTAINER_NAME', 'store-images')

# Lazy initialization of blob service client
_blob_service_client = None
_container_client = None


def _get_container_client():
    """Get or create the Azure Blob container client."""
    global _blob_service_client, _container_client
    
    if _container_client is not None:
        return _container_client
    
    if not AZURE_STORAGE_CONNECTION_STRING:
        print("Warning: AZURE_STORAGE_CONNECTION_STRING not set. Image upload disabled.")
        return None
    
    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings
        _blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        _container_client = _blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_NAME)
        
        # Create container if it doesn't exist
        try:
            _container_client.create_container(public_access='blob')
            print(f"Created container: {AZURE_STORAGE_CONTAINER_NAME}")
        except Exception as e:
            # Container likely already exists
            if "ContainerAlreadyExists" not in str(e):
                print(f"Container check: {e}")
        
        return _container_client
    except Exception as e:
        print(f"Error initializing Azure Blob Storage: {e}")
        return None


def upload_image(file_data: bytes, file_name: str, store_id: str, image_type: str) -> Optional[str]:
    """
    Upload an image to Azure Blob Storage.
    
    Args:
        file_data: The image file data in bytes
        file_name: The name of the file
        store_id: The ID of the store
        image_type: Either 'banner' or 'profile'
    
    Returns:
        The public URL of the uploaded image or None if upload failed
    """
    try:
        container_client = _get_container_client()
        if not container_client:
            print("Azure Blob Storage not configured. Skipping image upload.")
            return None
        
        from azure.storage.blob import ContentSettings
        
        # Create the path for the image
        blob_name = f"stores/{store_id}/{image_type}/{file_name}"
        
        # Get the content type
        content_type = mimetypes.guess_type(file_name)[0] or 'application/octet-stream'
        
        print(f"Uploading image to blob: {blob_name}")
        print(f"Using content type: {content_type}")
        
        # Upload the file to Azure Blob Storage
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(
            file_data,
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type)
        )
        
        # Return the public URL
        public_url = blob_client.url
        print(f"Upload successful. URL: {public_url}")
        return public_url
            
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return None


def delete_image(image_url: str) -> bool:
    """
    Delete an image from Azure Blob Storage.
    
    Args:
        image_url: The URL of the image to delete
    
    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        container_client = _get_container_client()
        if not container_client:
            print("Azure Blob Storage not configured. Skipping image delete.")
            return False
        
        # Extract the blob name from the URL
        # URL format: https://<account>.blob.core.windows.net/<container>/<blob_path>
        blob_name = image_url.split(f"/{AZURE_STORAGE_CONTAINER_NAME}/")[-1]
        
        print(f"Deleting blob: {blob_name}")
        
        # Delete the blob
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.delete_blob()
        
        print(f"Delete successful for blob: {blob_name}")
        return True
        
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return False 