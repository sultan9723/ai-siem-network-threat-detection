import random, time, pathlib

# Define some fake IPs and events
IPS = ["192.168.1.5", "192.168.1.20", "10.0.0.15"]
EVENTS = [
    "Failed password for invalid user root",
    "Connection closed by authenticating user admin",
    "Invalid user guest from"
]

# Output log file inside docs/
LOGFILE = pathlib.Path("docs/sample-logs.log")

def generate_logs(count=50, delay=0.1):
    """
    Generates synthetic logs for testing detection.
    Args:
        count (int): number of logs to generate
        delay (float): delay between log entries
    """
    LOGFILE.parent.mkdir(exist_ok=True)  # ensure docs/ exists
    with LOGFILE.open("w") as f:
        for _ in range(count):
            log = f"{random.choice(EVENTS)} from {random.choice(IPS)}"
            print(log, file=f)
            print(log)
            time.sleep(delay)

if __name__== "__main__":
    generate_logs()