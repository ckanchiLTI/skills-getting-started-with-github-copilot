import copy
from fastapi.testclient import TestClient
import pytest
from src import app as _app
from src.app import activities as activities_db

client = TestClient(_app.app)


@pytest.fixture(autouse=True)
def reset_activities():
    orig = copy.deepcopy(activities_db)
    yield
    activities_db.clear()
    activities_db.update(orig)


def test_signup_success():
    email = "newstudent@mergington.edu"
    res = client.post("/activities/Chess Club/signup", params={"email": email})
    assert res.status_code == 200
    assert email in activities_db["Chess Club"]["participants"]


def test_duplicate_signup_rejected():
    email = "duplicate@mergington.edu"
    res1 = client.post("/activities/Programming Class/signup", params={"email": email})
    assert res1.status_code == 200

    res2 = client.post("/activities/Programming Class/signup", params={"email": email})
    assert res2.status_code == 400
    assert "already signed up" in res2.json().get("detail", "")


def test_capacity_rejected():
    activities_db["Tiny"] = {
        "description": "Tiny activity",
        "schedule": "Now",
        "max_participants": 1,
        "participants": ["full@mergington.edu"]
    }
    res = client.post("/activities/Tiny/signup", params={"email": "new@mergington.edu"})
    assert res.status_code == 400
    assert "Activity is full" in res.json().get("detail", "")
    del activities_db["Tiny"]
