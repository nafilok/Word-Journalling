from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from uuid import UUID

from app.adapters.database.session import get_db
from app.adapters.database.repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Skema OAuth2 untuk membaca Bearer Token dari Header HTTP
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# --- PYDANTIC SCHEMAS (Data Transfer Objects / DTO) ---
class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


# --- DEPENDENCY INJECTION UNTUK PROTEKSI ENDPOINT ---
def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Middleware/Dependency untuk memverifikasi token pada endpoint tertutup.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau telah kadaluwarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau telah kadaluwarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Pengguna tidak ditemukan."
        )
    return UserResponse.model_validate(user)


# --- ENDPOINTS ---
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    
    # Validasi Keunikan Email & Username
    if user_repo.get_by_email(request.email):
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")
    if user_repo.get_by_username(request.username):
        raise HTTPException(status_code=400, detail="Username sudah digunakan.")
    
    # Hashing Password sebelum disimpan ke DB
    hashed_pwd = hash_password(request.password)
    new_user = user_repo.create(
        username=request.username,
        email=request.email,
        password_hash=hashed_pwd
    )
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(request.email)
    
    # Verifikasi Keberadaan User & Kebenaran Password
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah."
        )
    
    # Generate JWT Token
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Endpoint terproteksi untuk mengecek profil pengguna yang sedang login."""
    return current_user