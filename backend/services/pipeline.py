"""Alert processing pipeline: raw alert -> AI analysis -> incident creation."""

from services.ai_analyzer import analyze_alert
from services.incident_engine import process_event


def process_alert(alert: dict) -> dict:
    """Full pipeline: raw alert to incident.

    Args:
        alert: Normalized alert dictionary.

    Returns:
        Processing result with input, analysis, incident, and status.
    """
    analysis = analyze_alert(alert)
    incident = process_event(alert, analysis)

    return {
        "input": alert,
        "analysis": analysis,
        "incident": incident,
        "status": "processed"
    }
