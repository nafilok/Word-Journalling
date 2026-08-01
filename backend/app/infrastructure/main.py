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

import os
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
# CORS_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "")
# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

# -------------------------------------------------------------------------
# CORS CONFIGURATION (PRODUCTION-READY)
# -------------------------------------------------------------------------
raw_origins = os.getenv("CORS_ORIGINS", "") or os.getenv("ALLOWED_ORIGINS", "")

# Daftar origin dasar (Lokal & Vercel Production)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://word-journalling.vercel.app",  # Domain Vercel (tanpa garis miring di akhir)
]

# Parsing tambahan jika ada dari Environment Variable di Render
if raw_origins:
    for item in raw_origins.split(","):
        cleaned = item.strip().rstrip("/")  # Hapus spasi dan trailing slash '/'
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Mengizinkan origin spesifik
    allow_credentials=True,
    allow_methods=["*"],             # Mengizinkan semua HTTP Methods (GET, POST, OPTIONS, dll)
    allow_headers=["*"],             # Mengizinkan semua Headers (Content-Type, Authorization, dll)
)

# Include Routers
app.include_router(auth_router)
app.include_router(entries_router)

@app.get("/", tags=["System Health"])
def root():
    return {
        "status": "online",
        "message": "Engine FastAPI siap menerima request!",
        "docs": "/docs"
    }

@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "online",
        "message": "Engine FastAPI siap menerima request!"
    }