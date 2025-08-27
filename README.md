# AI-Enhanced SIEM & Network Threat Detection

## Overview
In this project I’m building a lab where I use *Wazuh + ELK* as a SIEM to collect logs and detect network-based threats.  
The idea is to simulate real-world attacks (like brute force logins, port scans, and maybe SQL injection) and show how they get detected inside the SIEM.

## Why I’m doing this
Most SOC teams deal with too many alerts and miss real issues.  
This project is my way of learning how logs, detections, and incident response reports come together in practice.  
I’ll also try to experiment with custom rules (Sigma/YARA) and eventually add some automation or AI to make alerts easier to understand.

## Tools I’ll be using
- Wazuh + ELK (main SIEM stack)
- Suricata or Zeek (for deeper network traffic logging later)
- Hydra, Nmap, DVWA (to simulate brute force, scans, SQLi)
- Python (to automate enrichment tasks like checking IPs against threat intel feeds)
- Networking basics (TCP/IP, SSH logs, web attack patterns)

## Repo Layout
- /docs       → screenshots, notes, and final incident reports
- /configs    → SIEM config files and detection rules
- /scripts    → Python helpers and enrichment scripts

## Disclaimer
Everything here is done in a *controlled lab setup*.  
Please don’t use these attack techniques against any system you don’t own or have permission to test.
