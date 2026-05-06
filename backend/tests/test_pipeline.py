"""Test: Full alert processing pipeline."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.pipeline import process_alert

alert = {
    "event_type": "brute_force",
    "source_ip": "192.168.1.10",
    "attempts": 120
}

result = process_alert(alert)

print(result)
