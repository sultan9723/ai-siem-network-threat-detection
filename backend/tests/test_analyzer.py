"""Test: AI analyzer module."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.ai_analyzer import analyze_alert

alert = {
    "event_type": "brute_force",
    "source_ip": "192.168.1.10",
    "attempts": 120
}

print(analyze_alert(alert))
