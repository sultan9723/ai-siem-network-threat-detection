import time, random

def brute_force(username="admin", target="192.168.1.10", attempts=None):
    """
    Simulates brute force login attempts against a target.
    Args:
        username (str): username to try
        target (str): target IP or hostname
        attempts (list): list of passwords to try
    """
    attempts = attempts or ["1234", "admin", "password", "letmein", "qwerty"]
    for pwd in attempts:
        print(f"[!] Trying {username}:{pwd} on {target}")
        time.sleep(random.uniform(0.2, 0.6))

if __name__== "__main__":
    brute_force()