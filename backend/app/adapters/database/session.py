import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:terserahelu@localhost:5433/journal_db"
)

# Engine setup dengan Connection Pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,        # Keeping 10 TCP Connections Open
    max_overflow=20,     # Authorized up to 20 connections when the bandwith high
    pool_pre_ping=True   # Checking connection health before get used
)

# Session Local factory untuk transaksi database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base untuk pemetaan model ORM
class Base(DeclarativeBase):
    """
    Base class eksplisit untuk semua model ORM.
    Dengan sintaks 'class', Pyrefly dapat mengenali Base di AST secara statis.
    """
    pass
def get_db():
    """
    Dependency Injection helper untuk FastAPI.
    Memastikan koneksi database ditutup setelah HTTP request selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
