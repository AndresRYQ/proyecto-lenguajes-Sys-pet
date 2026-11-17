import pytest
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.main import app


class ReadyDatabase:
    async def execute(self, statement):
        assert str(statement) == "SELECT 1"


async def override_database():
    yield ReadyDatabase()


@pytest.mark.parametrize("path", ["/usuarios", "/sedes"])
def test_admin_routes_reject_requests_without_a_token(path):
    with TestClient(app) as client:
        response = client.get(path)

    assert response.status_code == 401


def test_readiness_checks_database():
    app.dependency_overrides[get_db] = override_database
    try:
        with TestClient(app) as client:
            response = client.get("/ready")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"status": "ready"}
