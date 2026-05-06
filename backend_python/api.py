"""FastAPI application for AI SIEM with JWT authentication + structured API."""

import os
import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

from jose import jwt, JWTError

# ✅ TASK 6: Load environment variables before anything else
load_dotenv()

from auth import authenticate, create_token, create_refresh_token, SECRET_KEY, ALGORITHM
from config import setup_logging
from storage import load_incidents, save_incidents
from reporting import generate_incident_report
from incident_engine import validate_incident_id


# -------------------- SETUP --------------------

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI SIEM API",
    version="1.0.0"
)

# ✅ TASK 4: FIX CORS FOR PRODUCTION
# Restrict to your specific frontend domains
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL,  # e.g., https://your-siem-dashboard.vercel.app
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DEBUG MIDDLEWARE: Log every request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming {request.method} request to {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# -------------------- AUTH --------------------

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # ✅ TASK 2: Automatic expiration validation by jwt.decode
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# -------------------- MODELS --------------------

class SuccessResponse(BaseModel):
    data: Any
    status: str = "success"

class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False


# -------------------- ROUTES --------------------

@app.get("/")
def root():
    return {"message": "AI SIEM API Live", "status": "operational"}


# LOGIN ROUTE
@app.post("/login")
def login(data: LoginRequest, response: Response):
    if not data.username or not data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if authenticate(data.username, data.password):
        # Create short-lived access token (1 hour)
        access_token = create_token({"sub": data.username, "type": "access"})

        # Create refresh token with appropriate expiry
        if data.remember_me:
            # Long-lived: 30 days for "Remember Me"
            refresh_token = create_refresh_token(data.username)
            max_age = 30 * 24 * 60 * 60  # 30 days in seconds
        else:
            # Session cookie: expires when browser closes
            refresh_token = create_token(
                {"sub": data.username, "type": "refresh"},
                expires_delta=None  # uses default 60 min
            )
            max_age = None

        # Set HTTP-only cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,  # Set to True in production (HTTPS)
            samesite="strict",
            max_age=max_age,
            path="/"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")


# VERIFY SESSION (check if cookie is still valid)
@app.get("/verify-session")
def verify_session(request: Request):
    # Check for refresh token in cookies
    refresh_token = request.cokies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No session")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "username": payload.get("sub")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")


# LOGOUT (clear cookie)
@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/")
    return {"status": "logged out"}


#  PROTECTED ROUTES

@app.get("/incidents", response_model=SuccessResponse)
def get_incidents(user=Depends(verify_token)):
    try:
        incidents = load_incidents()
        return SuccessResponse(data=incidents)
    except Exception as e:
        logger.error(f"Failed to load incidents: {e}")
        raise HTTPException(status_code=500, detail="Error loading incidents")


@app.get("/incidents/{incident_id}", response_model=SuccessResponse)
def get_incident(incident_id: str, user=Depends(verify_token)):
    if not validate_incident_id(incident_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)

    if not incident:
        raise HTTPException(status_code=404, detail="Not found")

    return SuccessResponse(data=incident)


@app.get("/incidents/{incident_id}/report", response_model=SuccessResponse)
def get_report(incident_id: str, user=Depends(verify_token)):
    if not validate_incident_id(incident_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)

    if not incident:
        raise HTTPException(status_code=404, detail="Not found")

    report = generate_incident_report(incident)
    return SuccessResponse(data={"report": report})


#  INCIDENT ACTION (NEW)

@app.patch("/incidents/{incident_id}")
def update_incident(incident_id: str, data: dict, user=Depends(verify_token)):
    incidents = load_incidents()

    for inc in incidents:
        if inc["id"] == incident_id:
            inc["status"] = data.get("status", inc["status"])

    save_incidents(incidents)

    return {"status": "updated"}


# -------------------- ERROR HANDLER --------------------

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# ✅ TASK 10: DEPLOYMENT READINESS (Render entry point)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
