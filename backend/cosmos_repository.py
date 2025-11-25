from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from azure.cosmos import exceptions
from infrastructure.cosmos_client import get_cosmos_resources
import uuid


@dataclass
class SupabaseResponse:
    data: Optional[Union[List[Dict], Dict]] = None
    error: Optional[str] = None


def get_stores() -> List[Dict]:
    _, _, stores_container, _ = get_cosmos_resources()
    items = list(stores_container.read_all_items())
    return items


def get_store(store_id: str) -> Optional[Dict]:
    _, _, stores_container, _ = get_cosmos_resources()
    try:
        # Partition key is /id for stores
        item = stores_container.read_item(item=store_id, partition_key=store_id)
        return item
    except exceptions.CosmosResourceNotFoundError:
        return None


def create_store(store_data: Dict) -> Optional[Dict]:
    _, _, stores_container, _ = get_cosmos_resources()
    # Generate UUID if not provided
    if 'id' not in store_data:
        store_data['id'] = str(uuid.uuid4())
    created = stores_container.create_item(body=store_data)
    return created


def update_store(store_id: str, update_data: Dict) -> Optional[Dict]:
    _, _, stores_container, _ = get_cosmos_resources()
    try:
        existing = stores_container.read_item(item=store_id, partition_key=store_id)
    except exceptions.CosmosResourceNotFoundError:
        return None

    # Merge fields
    updated = {**existing, **update_data}
    replaced = stores_container.replace_item(item=store_id, body=updated)
    return replaced


def get_reviews(store_id: Optional[str] = None) -> SupabaseResponse:
    _, _, _, reviews_container = get_cosmos_resources()
    try:
        if store_id:
            # Partition key is /store_id for reviews; use query for flexibility
            query = "SELECT * FROM c WHERE c.store_id = @store_id"
            params = [{"name": "@store_id", "value": store_id}]
            items = list(reviews_container.query_items(query=query, parameters=params, enable_cross_partition_query=True))
            return SupabaseResponse(data=items)
        # All reviews
        items = list(reviews_container.read_all_items())
        return SupabaseResponse(data=items)
    except Exception as e:
        return SupabaseResponse(error=str(e))


def create_review(review_data: Dict) -> SupabaseResponse:
    _, _, _, reviews_container = get_cosmos_resources()
    try:
        # Generate UUID if not provided
        if 'id' not in review_data:
            review_data['id'] = str(uuid.uuid4())
        created = reviews_container.create_item(body=review_data)
        return SupabaseResponse(data=created)
    except Exception as e:
        return SupabaseResponse(error=str(e))


def update_review(review_id: str, update_data: Dict) -> SupabaseResponse:
    _, _, _, reviews_container = get_cosmos_resources()
    try:
        # Need partition key to read/replace. We assume review contains store_id
        # Fetch item by id across partitions
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": review_id}]
        results = list(reviews_container.query_items(query=query, parameters=params, enable_cross_partition_query=True))
        if not results:
            return SupabaseResponse(error="Review not found")
        existing = results[0]
        partition_key = existing.get("store_id")
        updated = {**existing, **update_data}
        replaced = reviews_container.replace_item(item=review_id, body=updated, partition_key=partition_key)
        return SupabaseResponse(data=replaced)
    except Exception as e:
        return SupabaseResponse(error=str(e))






