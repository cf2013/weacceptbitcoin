from typing import Tuple
from azure.cosmos import CosmosClient
from cosmos_config import get_config


_client: CosmosClient = None
_db = None
_stores_container = None
_reviews_container = None


def get_cosmos_resources() -> Tuple[CosmosClient, object, object, object]:
    global _client, _db, _stores_container, _reviews_container

    if _client is not None and _db is not None and _stores_container is not None and _reviews_container is not None:
        return _client, _db, _stores_container, _reviews_container

    cfg = get_config()
    _client = CosmosClient(url=cfg.endpoint, credential=cfg.key)
    _db = _client.get_database_client(cfg.database_id)
    _stores_container = _db.get_container_client(cfg.stores_container_id)
    _reviews_container = _db.get_container_client(cfg.reviews_container_id)

    return _client, _db, _stores_container, _reviews_container






