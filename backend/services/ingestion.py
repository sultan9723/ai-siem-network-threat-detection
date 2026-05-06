"""Log ingestion: stream and normalize alerts from JSONL files."""

import time
import json
import re
import os

from services.pipeline import process_alert

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(BASE_DIR, "data", "alerts.jsonl")

START_FROM_END = False


def stream_alerts():
    """Continuously stream alerts from the log file."""
    print(f"[INGESTION] Starting log stream from: {LOG_FILE}")

    try:
        with open(LOG_FILE, "r") as f:
            if START_FROM_END:
                f.seek(0, 2)
                print("[INGESTION] Streaming NEW logs only...")
            else:
                f.seek(0)
                print("[INGESTION] Reading existing logs + streaming new ones...")

            while True:
                line = f.readline()

                if not line:
                    time.sleep(1)
                    continue

                line = line.strip()
                if not line:
                    continue

                try:
                    match = re.search(r"\{.*\}", line)
                    if not match:
                        print("[ERROR] No valid JSON found:", line)
                        continue

                    raw = json.loads(match.group(0))
                    alert = normalize_alert(raw)

                    print("\n[RAW ALERT]")
                    print(alert)

                    result = process_alert(alert)

                    print("\n[EVENT PROCESSED]")
                    print(result)

                except json.JSONDecodeError:
                    print("[ERROR] Invalid JSON:", line)

                except Exception as e:
                    print("[ERROR] Processing failed:", e)

    except FileNotFoundError:
        print(f"[ERROR] Log file not found: {LOG_FILE}")


def normalize_alert(raw: dict) -> dict:
    """Normalize a raw log entry into a structured alert."""
    return {
        "event_type": extract_event_type(raw),
        "source_ip": raw.get("agent", {}).get("ip", "unknown"),
        "timestamp": raw.get("timestamp"),
        "raw": raw
    }


def extract_event_type(raw: dict) -> str:
    """Extract event type from rule description."""
    desc = raw.get("rule", {}).get("description", "").lower()

    if "brute force" in desc:
        return "brute_force"

    if "port scan" in desc:
        return "port_scan"

    return "unknown"
