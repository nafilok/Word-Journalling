# from fastapi import FastAPI
# from app.infrastructure.api.auth import router as auth_router

# app = FastAPI(
#     title = "AI Journaling API",
#     description = "Clean Architecture & Machine Learning ready based Backend engine.",
#     version = "1.0.0"
# )

# # Register Authentification Router
# app.include_router(auth_router)

# @app.get("/health", tags=["System Health"])
# def health_check():
#     # Endpoint sederhana untuk memastikan server berjalan dengan baik.
#     return {
#         "status": "online",
#         "message": "Engine FastAPI siap menerima request!"
#     }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.api.auth import router as auth_router
from app.infrastructure.api.entries import router as entries_router
from app.adapters.database.session import engine, Base

# PENTING: Impor modul models wajib ada agar SQLAlchemy memuat 
# definisi kelas UserModel dan JournalEntryModel ke dalam Base.metadata
import app.adapters.database.models

from sqlalchemy import text

# --- EKSEKUSI AUTOMATIC DDL GENERATION ---
# Perintah ini akan mengirim instruksi "CREATE TABLE IF NOT EXISTS" ke PostgreSQL
Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE entries ADD COLUMN IF NOT EXISTS emoji VARCHAR(20) DEFAULT 'happy'"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(
    title="AI Journaling API",
    description="Backend engine berbasis Clean Architecture & Machine Learning ready.",
    version="1.0.0"
)

# origins = [
#     "http://localhost:3000",      # Port default Next.js
#     "http://127.0.0.1:3000",
# ]

# --- KONFIGURASI CORS (Cross-Origin Resource Sharing) ---
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()] if allowed_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,       # Mengizinkan domain frontend mengakses API
    allow_origins=origins,       # Mengizinkan domain frontend Vercel & localhost mengakses API
    allow_credentials=True,      # Mengizinkan pengiriman cookie / authorization header
    allow_methods=["*"],          # Mengizinkan semua HTTP Method (GET, POST, PUT, DELETE, dll)
    allow_headers=["*"],          # Mengizinkan semua HTTP Headers
)

# Registrasi Router
app.include_router(auth_router)
app.include_router(entries_router)

@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "online",
        "message": "Engine FastAPI siap menerima request!"
    }