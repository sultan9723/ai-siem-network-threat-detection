from collections import defaultdict
from pathlib import Path

def detect_portscan(log_file="portscan-logs.log", threshold=5):
    """
    Detects port scanning activity from logs.
    Args:
        log_file (str): path to log file
        threshold (int): number of ports accessed before alert
    """
    path = Path(log_file)
    if not path.exists():
        print(f"[ERROR] Log file not found: {log_file}")
        return

    scans = defaultdict(set)
    with path.open() as f:
        for line in f:
            if ":" in line:
                ip, port = line.strip().split(":")
                scans[ip].add(port)

    for ip, ports in scans.items():
        if len(ports) >= threshold:
            print(f"[ALERT] Port scan from {ip} ({len(ports)} ports)")

if __name__ == "__main__":
    detect_portscan()