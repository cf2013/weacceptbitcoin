from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase configuration. Please check your .env file.")

supabase = create_client(supabase_url, supabase_key)

# Helper functions for common operations
def get_store(store_id: str):
    return supabase.table("stores").select("*").eq("id", store_id).single().execute()

def get_stores():
    return supabase.table("stores").select("*").execute()

def create_store(store_data: dict):
    return supabase.table("stores").insert(store_data).execute()

def update_store(store_id: str, store_data: dict):
    return supabase.table("stores").update(store_data).eq("id", store_id).execute()

def get_reviews(store_id: str):
    return supabase.table("reviews").select("*").eq("store_id", store_id).execute()

def create_review(review_data: dict):
    return supabase.table("reviews").insert(review_data).execute() 