from src.database import engine, Base
from src.db_models import Patient

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")