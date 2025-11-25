import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass
class CosmosConfig:
    endpoint: str
    key: str
    database_id: str
    stores_container_id: str
    reviews_container_id: str


def get_config() -> CosmosConfig:
    endpoint = os.getenv("COSMOSDB_ENDPOINT", "")
    key = os.getenv("COSMOSDB_KEY", "")

    if not endpoint or not key:
        raise ValueError("COSMOSDB_ENDPOINT and COSMOSDB_KEY must be set in environment variables")

    # Defaults can be adjusted later if needed
    return CosmosConfig(
        endpoint=endpoint,
        key=key,
        database_id=os.getenv("COSMOSDB_DATABASE_ID", "btcapproved"),
        stores_container_id=os.getenv("COSMOSDB_STORES_CONTAINER_ID", "stores"),
        reviews_container_id=os.getenv("COSMOSDB_REVIEWS_CONTAINER_ID", "reviews"),
    )






