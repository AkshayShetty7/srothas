from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel
from datetime import date, datetime, timedelta
import os

# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres123@localhost/clinic_rooms"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# =========================================================
# APP
# =========================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://srothas.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# AUTH
# =========================================================

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()

# =========================================================
# DATABASE MODELS
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True)

    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(Integer, ForeignKey("rooms.id"))

    name = Column(String)
    age = Column(Integer)
    nationality = Column(String)
    address = Column(String)

    checkin_date = Column(Date)
    checkout_date = Column(Date)

    room = relationship("Room", back_populates="bookings")


Base.metadata.create_all(bind=engine)

# =========================================================
# SCHEMAS
# =========================================================

class LoginSchema(BaseModel):
    username: str
    password: str


class RoomSchema(BaseModel):
    room_number: str


class BookingSchema(BaseModel):
    room_id: int
    name: str
    age: int
    nationality: str
    address: str
    checkin_date: date
    checkout_date: date


class PasswordChangeSchema(BaseModel):
    old_password: str
    new_password: str

# =========================================================
# DB DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

# =========================================================
# JWT FUNCTIONS
# =========================================================

def create_token(username: str):
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return username

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

# =========================================================
# CREATE DEFAULT USER
# =========================================================

def create_default_user():
    db = SessionLocal()

    existing = db.query(User).filter(
        User.username == "srothasayurveda"
    ).first()

    if not existing:
        hashed_password = pwd_context.hash("user123")

        user = User(
            username="srothasayurveda",
            password=hashed_password
        )

        db.add(user)
        db.commit()

    db.close()


create_default_user()

# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def root():
    return {"message": "Ayurvedic Clinic Room Management API"}

# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if not pwd_context.verify(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_token(user.username)

    return {
        "access_token": token
    }

# =========================================================
# CREATE ROOM
# =========================================================

@app.post("/rooms")
def create_room(
    data: RoomSchema,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    existing = db.query(Room).filter(
        Room.room_number == data.room_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Room already exists"
        )

    room = Room(
        room_number=data.room_number
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    return {
        "message": "Room created",
        "room": {
            "id": room.id,
            "room_number": room.room_number
        }
    }

# =========================================================
# GET ROOMS
# =========================================================

@app.get("/rooms")
def get_rooms(
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    rooms = db.query(Room).all()

    return rooms

# =========================================================
# DELETE ROOM
# =========================================================

@app.delete("/rooms/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    room = db.query(Room).filter(
        Room.id == room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    db.delete(room)
    db.commit()

    return {
        "message": "Room deleted"
    }

# =========================================================
# CREATE BOOKING
# =========================================================

@app.post("/bookings")
def create_booking(
    data: BookingSchema,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    if data.checkin_date >= data.checkout_date:
        raise HTTPException(
            status_code=400,
            detail="Checkout must be after checkin"
        )

    room = db.query(Room).filter(
        Room.id == data.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    overlapping = db.query(Booking).filter(
        Booking.room_id == data.room_id,
        data.checkin_date < Booking.checkout_date,
        data.checkout_date > Booking.checkin_date
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=400,
            detail="Room already booked for selected dates"
        )

    booking = Booking(
        room_id=data.room_id,
        name=data.name,
        age=data.age,
        nationality=data.nationality,
        address=data.address,
        checkin_date=data.checkin_date,
        checkout_date=data.checkout_date
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking created"
    }

# =========================================================
# GET BOOKINGS FOR ROOM
# =========================================================

@app.get("/bookings/{room_id}")
def get_bookings(
    room_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    bookings = db.query(Booking).filter(
        Booking.room_id == room_id
    ).all()

    return bookings

# =========================================================
# CHANGE PASSWORD
# =========================================================

@app.post("/change-password")
def change_password(
    data: PasswordChangeSchema,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not pwd_context.verify(
        data.old_password,
        user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Old password incorrect"
        )

    user.password = pwd_context.hash(data.new_password)

    db.commit()

    return {
        "message": "Password changed successfully"
    }

# =========================================================
# UPDATE BOOKING
# =========================================================

@app.put("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    data: BookingSchema,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if data.checkin_date >= data.checkout_date:
        raise HTTPException(
            status_code=400,
            detail="Checkout must be after checkin"
        )

    overlapping = db.query(Booking).filter(
        Booking.room_id == data.room_id,
        Booking.id != booking_id,
        data.checkin_date < Booking.checkout_date,
        data.checkout_date > Booking.checkin_date
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=400,
            detail="Room already booked for selected dates"
        )

    booking.room_id = data.room_id
    booking.name = data.name
    booking.age = data.age
    booking.nationality = data.nationality
    booking.address = data.address
    booking.checkin_date = data.checkin_date
    booking.checkout_date = data.checkout_date

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking updated successfully"
    }


# =========================================================
# DELETE BOOKING
# =========================================================

@app.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    db.delete(booking)

    db.commit()

    return {
        "message": "Booking deleted successfully"
    }