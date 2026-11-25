"""
Tests for booking creation, cancellation, and completion endpoints.
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
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatusEnum
from app.models.guide_profile import GuideProfile
from app.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_bookings.db"
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


@pytest.fixture
def guide_token(db_session, guide_user):
    return create_access_token(data={"sub": guide_user.email, "user_id": guide_user.id, "role": guide_user.role.value})


def test_create_booking_success(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    avail = Availability(tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), slots_remaining=2)
    db_session.add(avail)
    db_session.commit()

    response = client.post(
        "/api/v1/bookings/",
        params={"tour_listing_id": tour.id, "date": "2026-12-05T09:00:00", "num_clients": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["tourist_id"] == tourist_id
    assert data["status"] == "pending"

    db_session.refresh(avail)
    assert avail.slots_remaining == 1


def test_create_booking_unverified_guide_forbidden(client, tourist_token, db_session):
    token, _ = tourist_token
    guide = User(email="unverified@example.com", hashed_password="x", role=RoleEnum.guide, is_active=True)
    db_session.add(guide)
    db_session.commit()
    db_session.refresh(guide)
    profile = GuideProfile(user_id=guide.id, verification_status="pending")
    db_session.add(profile)
    db_session.commit()
    tour = TourListing(guide_id=guide.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    response = client.post(
        "/api/v1/bookings/",
        params={"tour_listing_id": tour.id, "date": "2026-12-05T09:00:00", "num_clients": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403


def test_get_my_bookings(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.pending)
    db_session.add(booking)
    db_session.commit()

    response = client.get("/api/v1/bookings/my", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_cancel_booking(client, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.accepted)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.put(
        f"/api/v1/bookings/{booking.id}/cancel",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_complete_booking(client, guide_token, tourist_token, guide_user, db_session):
    token, tourist_id = tourist_token
    tour = TourListing(guide_id=guide_user.id, title="Test Tour", price=50.0, capacity=5, active=True)
    db_session.add(tour)
    db_session.commit()
    db_session.refresh(tour)

    booking = Booking(tourist_id=tourist_id, tour_listing_id=tour.id, date=datetime(2026, 12, 5, 9, 0, 0), status=BookingStatusEnum.accepted)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.put(
        f"/api/v1/bookings/{booking.id}/complete",
        headers={"Authorization": f"Bearer {guide_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
