# Word-Journalling
WORD JOURNALING APPLICATION DOCUMENTATION
================================================================================

An end-to-end full-stack journaling application built with Clean Architecture, 
featuring a FastAPI backend, PostgreSQL/SQLAlchemy ORM, JWT authentication, and 
a modern Next.js 16 (App Router) + React 19 frontend with Tailwind CSS.


TABLE OF CONTENTS
--------------------------------------------------------------------------------
1. Project Overview
2. Architectural Design
3. Tech Stack
4. Project Directory Structure
5. Key Features
6. API Endpoints Documentation
7. Setup & Installation Guide
   - Prerequisites
   - Backend Setup
   - Frontend Setup
8. Environment Variables
9. Future Enhancements


1. PROJECT OVERVIEW
--------------------------------------------------------------------------------
Word Journaling is a personal daily journaling platform that allows users to 
securely write, save, and reflect on their daily experiences and emotional 
growth. The application is designed to be Machine Learning / AI ready, 
incorporating pure domain business logic (e.g., word count calculation, 
sentiment placeholder modules) while decoupling UI, API, database, and core 
business rules.


2. ARCHITECTURAL DESIGN
--------------------------------------------------------------------------------
The backend strictly adheres to Clean Architecture principles, ensuring that 
the core business domain remains isolated from frameworks, databases, and 
external services:

```
+------------------+        +--------------------------+        +------------------------+
|   Core Domain    | <----- |      Adapters / DB       | <----- |  Infrastructure / API  |
| (Pure Entities,  |        |  (Repositories, Models,  |        |   (FastAPI Routers,    |
|   Security Logic)|        |     External Clients)    |        |    JWT Middleware)     |
+------------------+        +--------------------------+        +------------------------+
```

- Core Layer (app/core):
  Contains pure Python domain entities (e.g., JournalEntryEntity) and security 
  utilities (hashing, JWT encoding/decoding) without web or DB framework dependencies.
  
- Adapters Layer (app/adapters):
  Contains database ORM models (SQLAlchemy UserModel & JournalEntryModel), 
  repository pattern abstractions for isolated database I/O, and external 
  service integration stubs (e.g., WeatherClient).
  
- Infrastructure Layer (app/infrastructure):
  Contains the FastAPI application instance, CORS configuration, API endpoint 
  routers, OAuth2/JWT middleware, and DTO schemas (Pydantic).


3. TECH STACK
--------------------------------------------------------------------------------

Backend Engine:
- Language: Python 3.10+
- Web Framework: FastAPI (v0.110+)
- Server: Uvicorn (v0.28+)
- ORM & DB: SQLAlchemy (v2.0+), PostgreSQL (psycopg2-binary)
- Data Validation: Pydantic (v2.6+), Email Validator
- Security & Auth: Passlib (Bcrypt), Python-Jose (JWT), Python-Multipart

Frontend Client:
- Framework: Next.js 16 (App Router)
- Library: React 19
- Language: TypeScript 5
- Styling: Tailwind CSS v4, PostCSS
- State & Routing: Native React Hooks, Next.js Router


4. PROJECT DIRECTORY STRUCTURE
--------------------------------------------------------------------------------

```text
Word-Journalling/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── entities.py           # Pure domain entities & business logic
│   │   │   └── security.py           # Bcrypt password hashing & JWT token handlers
│   │   ├── adapters/
│   │   │   ├── database/
│   │   │   │   ├── models.py         # SQLAlchemy DB models (users, entries)
│   │   │   │   ├── repository.py     # UserRepository & JournalRepository
│   │   │   │   └── session.py        # DB Engine & session generator
│   │   │   └── weather_client.py     # External API client adapter placeholder
│   │   └── infrastructure/
│   │       ├── api/
│   │       │   ├── auth.py           # Login, Register & /me endpoints
│   │       │   └── entries.py        # Journal create & list endpoints
│   │       └── main.py               # FastAPI entrypoint, CORS & DDL execution
│   ├── .env                          # Backend environment variables
│   └── requirements.txt              # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/            # Login page component
│   │   │   │   └── register/         # User registration page component
│   │   │   ├── (dashboard)/
│   │   │   │   └── journal/          # Main journal workspace & feed
│   │   │   ├── layout.tsx            # Global layout wrapper
│   │   │   ├── page.tsx              # Root page (Redirects to /login)
│   │   │   └── globals.css           # Global Tailwind CSS import
│   │   ├── components/               # Reusable UI component modules
│   │   ├── lib/
│   │   │   └── api.ts                # Client API fetch wrapper with Bearer Auth
│   │   └── types/
│   │       ├── auth.ts               # Auth DTO interfaces
│   │       └── journal.ts            # Journal DTO interfaces
│   ├── package.json                  # Node.js dependencies & scripts
│   └── tsconfig.json                 # TypeScript compiler configuration
│
├── .gitignore
├── pyrightconfig.json
├── README.md                         # Main repository documentation (Markdown)
└── README.txt                        # Project documentation
```


5. KEY FEATURES
--------------------------------------------------------------------------------

1. Authentication & Security:
   - User Registration with unique email and username validation.
   - Secure Password Hashing using Bcrypt.
   - OAuth2 Bearer Password flow returning JWT Access Tokens valid for 24 hours.
   - Protected client-side & server-side routes via JWT header validation.

2. Journal Entry Management:
   - Create new journal entries with real-time text input.
   - Domain-level word count calculation executed inside pure domain entities.
   - Paginated feed listing user journal entries in descending chronological order.
   - Data isolation ensuring users can only read and write their own journals.

3. Responsive & Clean UI:
   - Modern, minimalist interface styled with Tailwind CSS.
   - Dynamic reactivity with instant list updating upon entry submission.
   - Emotional trend & analytics status preview card.


6. API ENDPOINTS DOCUMENTATION
--------------------------------------------------------------------------------

Base URL: http://127.0.0.1:8000

1. Health Check
   GET /health
   - Description: Check server status.
   - Response: {"status": "online", "message": "Engine FastAPI siap menerima request!"}

2. User Registration
   POST /api/auth/register
   - Body (JSON):
     {
       "username": "johndoe",
       "email": "john@example.com",
       "password": "securepassword"
     }
   - Response: User object (201 Created)

3. User Login
   POST /api/auth/login
   - Body (URL-encoded Form):
     username=john@example.com&password=securepassword
   - Response:
     {
       "access_token": "<JWT_TOKEN_STRING>",
       "token_type": "bearer"
     }

4. Get Current User Profile
   GET /api/auth/me
   - Headers: Authorization: Bearer <JWT_TOKEN_STRING>
   - Response: User details (id, username, email)

5. Create Journal Entry
   POST /api/entries
   - Headers: Authorization: Bearer <JWT_TOKEN_STRING>
   - Body (JSON):
     {
       "content": "Today was a productive day building my journaling app."
     }
   - Response: Created entry object with word_count & timestamps (201 Created)

6. Get User Journal Entries
   GET /api/entries?page=1&limit=10
   - Headers: Authorization: Bearer <JWT_TOKEN_STRING>
   - Response: Array of journal entry objects for the authenticated user


7. SETUP & INSTALLATION GUIDE
--------------------------------------------------------------------------------

Prerequisites:
- Python 3.10 or higher
- Node.js 18.x or higher & npm
- PostgreSQL database instance (or SQLite for development fallback)

A. BACKEND SETUP:
1. Navigate to the backend directory:
   cd backend

2. Create a virtual environment:
   python -m venv .venv

3. Activate the virtual environment:
   - Windows (PowerShell):
     .venv\Scripts\Activate.ps1
   - Linux/macOS:
     source .venv/bin/activate

4. Install backend dependencies:
   pip install -r requirements.txt

5. Configure environment variables in backend/.env:
   DATABASE_URL=postgresql://user:password@localhost:5432/word_journal_db
   JWT_SECRET_KEY=your_secret_key_here

6. Run the FastAPI development server:
   uvicorn app.infrastructure.main:app --reload --port 8000

7. Access API Interactive Documentation (Swagger UI):
   http://127.0.0.1:8000/docs

B. FRONTEND SETUP:
1. Navigate to the frontend directory:
   cd frontend

2. Install Node.js dependencies:
   npm install

3. (Optional) Configure environment variable if API URL differs:
   Create a .env.local file:
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

4. Run the Next.js development server:
   npm run dev

5. Open the application in your browser:
   http://localhost:3000


8. ENVIRONMENT VARIABLES
--------------------------------------------------------------------------------

Backend (.env):
- DATABASE_URL: Database connection string (e.g. PostgreSQL or SQLite).
- JWT_SECRET_KEY: Secret key used to sign JWT tokens.

Frontend (.env.local):
- NEXT_PUBLIC_API_URL: Base URL for backend API requests (default: http://127.0.0.1:8000).


9. FUTURE ENHANCEMENTS
--------------------------------------------------------------------------------
- Integration of Natural Language Processing (NLP) / Sentiment Analysis models.
- Contextual enrichment with weather data via WeatherClient adapter.
- Entry search and filtering by keywords or tags.
- Detailed sentiment and productivity analytics visualization charts.
