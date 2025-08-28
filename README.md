# AI-Enhanced SIEM & Network Threat Detection

## Overview
This project is a hands-on cybersecurity lab focused on building a SIEM environment using Wazuh and the ELK stack.  
The goal is to simulate real-world attacks (such as brute force logins, port scans, and SQL injection) and demonstrate how they can be detected and analyzed inside a SIEM.

Security Operation Centers often face challenges with high alert volumes and difficulty identifying real threats.  
This project explores how logs, detection rules, and incident reports can be combined to improve visibility and response.  
It also includes experiments with custom rules (Sigma/YARA) and the possibility of adding automation or AI to make alerts easier to interpret.

## Tools and Technologies
- Wazuh + ELK (SIEM stack)
- Suricata or Zeek (for future network traffic analysis)
- Hydra, Nmap, DVWA (to simulate brute force, port scans, SQLi)
- Python (for automation and enrichment, such as checking IPs against threat intelligence feeds)
- Networking fundamentals (TCP/IP, SSH logs, web attack patterns)

## Repository Layout
- docs/       → screenshots, notes, and incident reports
- configs/    → SIEM config files and detection rules
- scripts/    → Python scripts for attack simulation and detection

## Usage

Clone the repository:
```bash
git clone https://github.com/sultan9723/ai-siem-network-threat-detection.git
cd ai-siem-network-threat-detection
1. Run Brute Force Simulator
python scripts/bruteforce_simulator.py
2. Generate Logs
python scripts/log_generator.py
3. Detect Brute Force
python scripts/detection_engine.py 
4. Detect Port Scans
python scripts/portscan_detector.py
Roadmap
	•	Build Python scripts for attack simulation and detection
	•	Integrate logs into Wazuh SIEM
	•	Add Suricata for deeper packet inspection
	•	Create and test custom detection rules (Sigma/YARA)
	•	Experiment with AI-driven alert summarization
	•	Finalize SIEM dashboard and reporting

Disclaimer
All activities are performed in a controlled lab environment.
Do not use these attack techniques against any system you do not own or have explicit permission to test.