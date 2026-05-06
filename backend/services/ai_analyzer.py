"""Rule-based and AI-enhanced threat analysis."""

import os
import json
import re

import requests
from dotenv import load_dotenv

# Load .env from backend directory (two levels up from services/)
_dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(_dotenv_path)

API_KEY = os.getenv("OPENROUTER_API_KEY")


def rule_based_analysis(alert: dict) -> dict:
    """Classify alerts using rule-based pattern matching."""
    event = alert.get("event_type", "").lower()

    if event == "brute_force":
        return {
            "threat_type": "Brute Force Attack",
            "severity": "High",
            "explanation": "Multiple failed login attempts detected, indicating a brute force attack.",
            "recommended_action": "Block the source IP and enable rate limiting."
        }

    if event == "port_scan":
        return {
            "threat_type": "Port Scanning Activity",
            "severity": "Medium",
            "explanation": "Multiple ports were scanned, indicating reconnaissance activity.",
            "recommended_action": "Monitor the IP and restrict access if necessary."
        }

    return {
        "threat_type": "Unknown",
        "severity": "Low",
        "explanation": "No known threat pattern detected.",
        "recommended_action": "Monitor the activity."
    }


def analyze_alert(alert: dict) -> dict:
    """Analyze an alert using rule-based classification with optional AI enhancement.

    Falls back to rule-based analysis if AI is unavailable.
    """
    base_result = rule_based_analysis(alert)

    if not API_KEY:
        return base_result

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"

        prompt = f"""
You are a cybersecurity analyst.

Improve this analysis:

Alert:
{json.dumps(alert)}

Base Analysis:
{json.dumps(base_result)}

Return ONLY JSON with same keys:
threat_type, severity, explanation, recommended_action
"""

        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "ai-siem-project"
            },
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=10
        )

        response.raise_for_status()
        data = response.json()

        text = data["choices"][0]["message"]["content"]

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return base_result

        return json.loads(match.group(0))

    except Exception:
        return base_result
