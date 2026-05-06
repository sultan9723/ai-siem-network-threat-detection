"""Entry point for the AI SIEM backend.

Run with:
    python main.py
or
    uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
"""

from api.app import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("api.app:app", host="0.0.0.0", port=port, reload=True)
