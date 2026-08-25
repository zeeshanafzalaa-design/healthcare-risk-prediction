from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime

from src.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    pregnancies = Column(Float)
    glucose = Column(Float)
    blood_pressure = Column(Float)
    skin_thickness = Column(Float)
    insulin = Column(Float)
    bmi = Column(Float)
    diabetes_pedigree_function = Column(Float)
    age = Column(Integer)

    prediction = Column(Integer)
    probability = Column(Float)
    risk_level = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)