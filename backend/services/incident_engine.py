"""Incident engine: event correlation, risk scoring, and lifecycle management."""

import logging
import re
from datetime import datetime
from typing import Any

from services.storage import load_incidents, save_incidents

logger = logging.getLogger(__name__)

MAX_IP_LENGTH = 45
VALID_EVENT_TYPES = {"brute_force", "port_scan", "unknown"}


def validate_incident_id(incident_id: str | None) -> bool:
    """Validate incident ID format (INC-001 to INC-999)."""
    if not incident_id or not isinstance(incident_id, str):
        logger.warning(f"Invalid incident ID type: {type(incident_id)}")
        return False

    is_valid = bool(re.match(r"^INC-\d{3}$", incident_id))
    if not is_valid:
        logger.warning(f"Invalid incident ID format: {incident_id}")
    return is_valid


def validate_source_ip(ip: str | None) -> bool:
    """Validate IP address format (IPv4 or IPv6)."""
    if not ip or not isinstance(ip, str):
        logger.warning(f"Invalid IP type: {type(ip)}")
        return False

    if len(ip) > MAX_IP_LENGTH:
        logger.warning(f"IP address too long: {len(ip)} > {MAX_IP_LENGTH}")
        return False

    ipv4_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    ipv6_pattern = r"^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$"

    is_valid = bool(re.match(ipv4_pattern, ip) or re.match(ipv6_pattern, ip))
    if not is_valid:
        logger.warning(f"Invalid IP format: {ip}")
    return is_valid


def validate_event_type(event_type: str | None) -> str:
    """Validate and normalize event type."""
    if not event_type or not isinstance(event_type, str):
        logger.warning(f"Invalid event type: {event_type}")
        return "unknown"

    normalized = event_type.lower().strip()

    if normalized not in VALID_EVENT_TYPES:
        logger.warning(f"Unknown event type: {event_type}, defaulting to unknown")
        return "unknown"

    return normalized


def process_event(alert: dict | None, analysis: dict | None) -> dict[str, Any] | None:
    """Process an alert and its analysis to update or create an incident.

    Correlates events by source IP and calculates cumulative risk scores.
    """
    if not alert or not isinstance(alert, dict):
        logger.warning(f"Invalid alert type: {type(alert)}")
        return None

    if not analysis or not isinstance(analysis, dict):
        logger.warning(f"Invalid analysis type: {type(analysis)}")
        return None

    source_ip = alert.get("source_ip")
    if not validate_source_ip(source_ip):
        logger.warning(f"Invalid source IP in alert: {source_ip}")
        return None

    event_type = validate_event_type(alert.get("event_type"))
    timestamp = alert.get("timestamp") or datetime.utcnow().isoformat() + "Z"
    severity = analysis.get("severity", "Low")

    logger.info(f"Processing event: type={event_type}, source_ip={source_ip}, severity={severity}")

    try:
        incidents = load_incidents()

        event_weights = {
            "brute_force": 30,
            "port_scan": 20
        }
        event_weight = event_weights.get(event_type, 10)

        severity_weights = {
            "High": 30,
            "Medium": 20,
            "Low": 10
        }
        severity_weight = severity_weights.get(severity, 10)

        added_risk = event_weight + severity_weight

        active_incident = next(
            (inc for inc in incidents if inc.get("source_ip") == source_ip and inc.get("status") == "active"),
            None
        )

        if active_incident:
            logger.info(f"Updating existing incident: {active_incident.get('id')}")
            if "events" not in active_incident or not isinstance(active_incident["events"], list):
                active_incident["events"] = []
            active_incident["events"].append(event_type)

            if "event_count" not in active_incident:
                active_incident["event_count"] = len(active_incident["events"])
            else:
                active_incident["event_count"] += 1
            active_incident["count"] = active_incident["event_count"]

            if "first_seen" not in active_incident:
                active_incident["first_seen"] = active_incident.get("created_at", timestamp)
            active_incident["last_seen"] = timestamp

            active_incident["risk_score"] = min(100, active_incident["risk_score"] + added_risk)

            result_incident = active_incident
        else:
            incident_id = f"INC-{len(incidents) + 1:03d}"
            logger.info(f"Creating new incident: {incident_id}")
            new_incident = {
                "id": incident_id,
                "source_ip": source_ip,
                "risk_score": min(100, 50 + added_risk),
                "status": "active",
                "events": [event_type],
                "event_count": 1,
                "first_seen": timestamp,
                "last_seen": timestamp,
                "count": 1,
                "created_at": timestamp,
                "analysis": analysis
            }
            incidents.append(new_incident)
            result_incident = new_incident

        save_incidents(incidents)
        logger.info(f"Event processed successfully: {result_incident.get('id')}, risk_score={result_incident.get('risk_score')}")
        return result_incident

    except Exception as e:
        logger.error(f"Error processing event: {e}", exc_info=True)
        return None
