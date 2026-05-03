from ai_analyzer import analyze_alert
from incident_engine import process_event

def process_alert(alert: dict) -> dict:
    """
    Full pipeline:
    raw alert → AI analysis → incident creation
    """

    analysis = analyze_alert(alert)
    incident = process_event(alert, analysis)

    return {
        "input": alert,
        "analysis": analysis,
        "incident": incident,
        "status": "processed"
    }
