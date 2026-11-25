"""
Tests for review creation endpoint.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
from app.db.session import Base, get_db
from app.models.user import User, RoleEnum
from app.models.tour_listing import TourListing
from app.models.booking import Booking, BookingStatusEnum
from app.models.guide_profile import GuideProfile
from app.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_reviews.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db(db):
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    db = TestingSessionLocal()
    previous = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = override_get_db(db)
    yield TestClient(app)
    if previous is not None:
        app.dependency_overrides[get_db] = previous
    else:
        app.dependency_overrides.pop(get_db, None)
    db.close()


@pytest.fixture
def db_session(test_db):
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture
def tourist_token(db_session):
    user = User(email="tourist@example.com", hashed_password="x", role=RoleEnum.tourist, is_active=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role.value}), user.id


@pytest.fixture
def guide_user(db_session):
    user = User(email="guide@example.com", hashed_password="x", role=RoleEnum.guide, is_active=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    profile = GuideProfile(user_id=user.id, verification_status="approved")
    db_session.add(profile)
    db_session.commit()
    return user


def test_create_review_requires_completed_booking(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.pending)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.post(
        "/api/v1/reviews/",
        params={"booking_id": booking.id, "rating": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "completed" in response.json()["detail"].lower()


def test_create_review_success(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.completed)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.post(
        "/api/v1/reviews/",
        params={"booking_id": booking.id, "rating": 5, "body": "Great tour!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["rating"] == 5
    assert data["body"] == "Great tour!"


def test_one_review_per_booking(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.completed)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    client.post("/api/v1/reviews/", params={"booking_id": booking.id, "rating": 5}, headers={"Authorization": f"Bearer {token}"})
    response = client.post("/api/v1/reviews/", params={"booking_id": booking.id, "rating": 3}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 400
