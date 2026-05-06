"""FastAPI application with JWT authentication and structured API routes."""

import os
import logging

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from core.config import setup_logging
from core.security import authenticate, create_token, SECRET_KEY, ALGORITHM
from api.schemas import SuccessResponse, LoginRequest
from services.storage import load_incidents, save_incidents
from services.reporting import generate_incident_report
from services.incident_engine import validate_incident_id

# Load environment variables from backend directory
from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), ".env"))

# Setup
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI SIEM API",
    version="1.0.0"
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming {request.method} request to {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Auth
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token from Authorization header."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# Routes

@app.get("/")
def root():
    return {"message": "AI SIEM API Live", "status": "operational"}


@app.post("/login")
def login(data: LoginRequest):
    if authenticate(data.username, data.password):
        token = create_token({"sub": data.username})
        return {"access_token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")


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


@app.patch("/incidents/{incident_id}")
def update_incident(incident_id: str, data: dict, user=Depends(verify_token)):
    incidents = load_incidents()

    for inc in incidents:
        if inc["id"] == incident_id:
            inc["status"] = data.get("status", inc["status"])

    save_incidents(incidents)

    return {"status": "updated"}


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# Entry point for uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("api.app:app", host="0.0.0.0", port=port, reload=False)
