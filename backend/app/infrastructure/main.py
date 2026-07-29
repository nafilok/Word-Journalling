from fastapi import FastAPI
from app.infrastructure.api.auth import router as auth_router

app = FastAPI(
    title = "AI Journaling API",
    description = "Clean Architecture & Machine Learning ready based Backend engine.",
    version = "1.0.0"
)

# Register Authentification Router
app.include_router(auth_router)

@app.get("/health", tags=["System Health"])
def health_check():
    # Endpoint sederhana untuk memastikan server berjalan dengan baik.
    return {
        "status": "online",
        "message": "Engine FastAPI siap menerima request!"
    }