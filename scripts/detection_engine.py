from collections import Counter
from pathlib import Path

def detect_bruteforce(log_file="docs/sample-logs.log", threshold=3):
    """
    Detects brute force attempts from logs.
    Args:
        log_file (str): path to log file
        threshold (int): number of attempts before alert
    """
    path = Path(log_file)
    if not path.exists():
        print(f"[ERROR] Log file not found: {log_file}")
        return

    with path.open() as f:
        ips = [line.split()[-1] for line in f if line.strip()]

    for ip, count in Counter(ips).items():
        if count > threshold:
            print(f"[ALERT] Brute force from {ip} ({count} attempts)")

if __name__ == "__main__":
    detect_bruteforce()