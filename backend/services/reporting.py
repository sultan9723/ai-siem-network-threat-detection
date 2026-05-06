"""Incident report generation."""


def generate_incident_report(incident: dict) -> str:
    """Generate a human-readable incident report from incident data.

    Args:
        incident: Incident dictionary with full details.

    Returns:
        Formatted report string.
    """
    report_id = incident.get("id", "N/A")
    source_ip = incident.get("source_ip", "N/A")
    risk_score = incident.get("risk_score", 0)
    status = incident.get("status", "unknown").capitalize()
    event_count = incident.get("count", 0)

    analysis = incident.get("analysis", {})
    explanation = analysis.get("explanation", "No explanation provided.")
    recommended_action = analysis.get("recommended_action", "No specific actions recommended.")

    report = []
    report.append(f"Incident ID: {report_id}")
    report.append(f"Source IP:   {source_ip}")
    report.append(f"Status:      {status}")
    report.append(f"Risk Score:  {risk_score}")
    report.append(f"Event Count: {event_count}")
    report.append("")
    report.append("Summary:")
    report.append(explanation)
    report.append("")
    report.append("Recommended Actions:")

    if "\n" in recommended_action:
        report.append(recommended_action)
    else:
        actions = recommended_action.split(". ")
        for action in actions:
            if action.strip():
                clean_action = action.strip().rstrip(".")
                report.append(f"* {clean_action}")

    return "\n".join(report)
