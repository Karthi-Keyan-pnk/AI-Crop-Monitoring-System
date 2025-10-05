from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings

_settings = get_settings()
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        uri = (_settings.MONGODB_URI or "").strip()
        _client = AsyncIOMotorClient(uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[_settings.MONGODB_DB]
    return _db


async def close_db() -> None:
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None
