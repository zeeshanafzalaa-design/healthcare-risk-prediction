from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

from src.database import get_db
from src.db_models import Patient


# ============================================================
# 1. PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "xgboost_model.pkl"


# ============================================================
# 2. LOAD ML MODEL
# ============================================================

model = joblib.load(MODEL_PATH)


# ============================================================
# 3. CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Healthcare Early Disease Risk Prediction API",
    description="Diabetes risk prediction API with PostgreSQL database",
    version="1.0.0"
)


# ============================================================
# 4. ENABLE CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# 5. PATIENT INPUT MODEL
# ============================================================

class PatientData(BaseModel):

    pregnancies: float = Field(
        ...,
        ge=0,
        description="Number of pregnancies"
    )

    glucose: float = Field(
        ...,
        ge=0,
        description="Glucose concentration"
    )

    blood_pressure: float = Field(
        ...,
        ge=0,
        description="Blood pressure"
    )

    skin_thickness: float = Field(
        ...,
        ge=0,
        description="Skin thickness"
    )

    insulin: float = Field(
        ...,
        ge=0,
        description="Insulin level"
    )

    bmi: float = Field(
        ...,
        ge=0,
        description="Body Mass Index"
    )

    diabetes_pedigree_function: float = Field(
        ...,
        ge=0,
        description="Diabetes pedigree function"
    )

    age: float = Field(
        ...,
        ge=0,
        description="Patient age"
    )


# ============================================================
# 6. RISK LEVEL FUNCTION
# ============================================================

def get_risk_level(probability):

    if probability < 0.25:

        return "Low"

    elif probability < 0.50:

        return "Moderate"

    elif probability < 0.75:

        return "High"

    else:

        return "Critical"


# ============================================================
# 7. FEATURE ENGINEERING
# ============================================================

def create_features(data):

    # Create basic dataframe
    df = pd.DataFrame([
        {
            "Pregnancies": data.pregnancies,
            "Glucose": data.glucose,
            "BloodPressure": data.blood_pressure,
            "SkinThickness": data.skin_thickness,
            "Insulin": data.insulin,
            "BMI": data.bmi,
            "DiabetesPedigreeFunction":
                data.diabetes_pedigree_function,
            "Age": data.age
        }
    ])

    # -----------------------------------------
    # BMI Category
    # -----------------------------------------

    df["BMI_Category"] = pd.cut(
        df["BMI"],
        bins=[
            0,
            18.5,
            25,
            30,
            float("inf")
        ],
        labels=[0, 1, 2, 3],
        include_lowest=True
    ).astype(int)

    # -----------------------------------------
    # Glucose Category
    # -----------------------------------------

    df["Glucose_Category"] = pd.cut(
        df["Glucose"],
        bins=[
            0,
            100,
            126,
            float("inf")
        ],
        labels=[0, 1, 2],
        include_lowest=True
    ).astype(int)

    # -----------------------------------------
    # Age Category
    # -----------------------------------------

    df["Age_Category"] = pd.cut(
        df["Age"],
        bins=[
            0,
            30,
            50,
            float("inf")
        ],
        labels=[0, 1, 2],
        include_lowest=True
    ).astype(int)

    # -----------------------------------------
    # BMI × Glucose Interaction
    # -----------------------------------------

    df["BMI_Glucose_Interaction"] = (
        df["BMI"] * df["Glucose"]
    )

    return df


# ============================================================
# 8. HOME ENDPOINT
# ============================================================

@app.get("/")
def home():

    return {
        "message":
            "Healthcare Risk Prediction API is running",

        "version":
            "1.0.0",

        "status":
            "healthy"
    }


# ============================================================
# 9. HEALTH CHECK ENDPOINT
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",

        "model_loaded":
            True
    }


# ============================================================
# 10. PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(
    data: PatientData,
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # Create features
    # -----------------------------------------

    input_data = create_features(data)

    # -----------------------------------------
    # Make prediction
    # -----------------------------------------

    prediction = model.predict(
        input_data
    )[0]

    # -----------------------------------------
    # Get probability
    # -----------------------------------------

    probability = model.predict_proba(
        input_data
    )[0][1]

    probability = float(probability)

    # -----------------------------------------
    # Get risk level
    # -----------------------------------------

    risk_level = get_risk_level(
        probability
    )

    # -----------------------------------------
    # Clinical-style message
    # -----------------------------------------

    if risk_level == "Critical":

        message = (
            "High estimated risk. "
            "Clinical review is recommended."
        )

    elif risk_level == "High":

        message = (
            "Elevated estimated risk. "
            "Clinical review is recommended."
        )

    elif risk_level == "Moderate":

        message = (
            "Moderate estimated risk. "
            "Further clinical assessment may be appropriate."
        )

    else:

        message = (
            "Low estimated risk based on this model."
        )

    # ========================================================
    # SAVE PATIENT PREDICTION TO POSTGRESQL
    # ========================================================

    patient = Patient(

        pregnancies=data.pregnancies,

        glucose=data.glucose,

        blood_pressure=data.blood_pressure,

        skin_thickness=data.skin_thickness,

        insulin=data.insulin,

        bmi=data.bmi,

        diabetes_pedigree_function=
            data.diabetes_pedigree_function,

        age=data.age,

        prediction=int(prediction),

        probability=probability,

        risk_level=risk_level
    )

    # Add patient to database
    db.add(patient)

    # Save changes
    db.commit()

    # Get generated patient ID
    db.refresh(patient)

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "patient_id":
            patient.id,

        "prediction":
            int(prediction),

        "probability":
            round(probability, 4),

        "probability_percentage":
            round(
                probability * 100,
                2
            ),

        "risk_level":
            risk_level,

        "message":
            message,

        "disclaimer":
            "This prototype provides an estimated risk score "
            "and is not a medical diagnosis."
    }


# ============================================================
# 11. GET ALL PATIENTS
# ============================================================

@app.get("/patients")
def get_patients(
    db: Session = Depends(get_db)
):

    patients = (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .all()
    )

    return [

        {
            "patient_id":
                patient.id,

            "pregnancies":
                patient.pregnancies,

            "glucose":
                patient.glucose,

            "blood_pressure":
                patient.blood_pressure,

            "skin_thickness":
                patient.skin_thickness,

            "insulin":
                patient.insulin,

            "bmi":
                patient.bmi,

            "diabetes_pedigree_function":
                patient.diabetes_pedigree_function,

            "age":
                patient.age,

            "prediction":
                patient.prediction,

            "probability":
                round(
                    patient.probability,
                    4
                ),

            "probability_percentage":
                round(
                    patient.probability * 100,
                    2
                ),

            "risk_level":
                patient.risk_level,

            "created_at":
                patient.created_at
        }

        for patient in patients
    ]


# ============================================================
# 12. GET SINGLE PATIENT
# ============================================================

@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id
        )
        .first()
    )

    if patient is None:

        return {
            "error":
                "Patient not found"
        }

    return {

        "patient_id":
            patient.id,

        "pregnancies":
            patient.pregnancies,

        "glucose":
            patient.glucose,

        "blood_pressure":
            patient.blood_pressure,

        "skin_thickness":
            patient.skin_thickness,

        "insulin":
            patient.insulin,

        "bmi":
            patient.bmi,

        "diabetes_pedigree_function":
            patient.diabetes_pedigree_function,

        "age":
            patient.age,

        "prediction":
            patient.prediction,

        "probability":
            round(
                patient.probability,
                4
            ),

        "probability_percentage":
            round(
                patient.probability * 100,
                2
            ),

        "risk_level":
            patient.risk_level,

        "created_at":
            patient.created_at
    }