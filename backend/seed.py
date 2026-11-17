import asyncio

from app.bootstrap_admin import bootstrap


if __name__ == "__main__":
    asyncio.run(bootstrap())
