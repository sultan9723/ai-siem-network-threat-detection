# AI-Enhanced SIEM and Network Threat Detection System

## Overview

This project implements a lightweight, AI-enhanced Security Information and Event Management (SIEM) system designed to simulate real-world security monitoring workflows.

The system ingests security logs, detects suspicious activity, correlates events into incidents, and applies AI-based analysis to generate contextual threat intelligence and response recommendations. The processed data is exposed via a REST API and visualized through a modern web dashboard.

The objective is to demonstrate an end-to-end pipeline that transforms raw logs into actionable security insights.

---

## Objective

The primary goals of this project are:

* To design and implement a real-time log ingestion pipeline
* To detect common network threats such as brute force attacks and port scans
* To correlate raw events into structured security incidents
* To integrate AI for threat classification and interpretation
* To provide a user interface for monitoring and analysis

---

## Problem Statement

Security Operation Centers (SOCs) face significant challenges in managing large volumes of alerts and identifying meaningful threats. Common issues include:

* High alert volume with low signal-to-noise ratio
* Lack of contextual information for decision-making
* Difficulty correlating isolated events into incidents
* Manual effort required for analysis and response

Traditional SIEM systems often generate alerts but do not provide sufficient intelligence to support rapid and informed decision-making.

---

## Solution

This system addresses these challenges by combining log processing, event correlation, and AI-driven analysis.

### Event Processing

Raw logs are ingested and normalized to extract relevant security attributes.

### Detection Pipeline

Events are analyzed to identify known attack patterns such as brute force attempts and port scanning.

### Incident Correlation

Related events are grouped into incidents based on shared attributes such as source IP. Each incident tracks:

* Event count
* Timeline (first seen and last seen)
* Event types

### AI Analysis

An AI component evaluates each incident and provides:

* Threat classification
* Severity level
* Human-readable explanation
* Recommended response actions

### Visualization

A web-based dashboard displays incidents and associated intelligence in a structured and accessible format.

---

## System Architecture

```text
Log Sources (Simulated Attacks)
           │
           ▼
Ingestion Layer (stream_alerts)
           │
           ▼
Detection Pipeline (process_alert)
           │
           ▼
Incident Engine (correlation)
           │
           ▼
AI Analyzer (threat interpretation)
           │
           ▼
Storage Layer (JSON persistence)
           │
           ▼
FastAPI Backend (/incidents API)
           │
           ▼
Next.js Dashboard (UI)
```

---

## Technology Stack

### Backend

* Python
* FastAPI
* JSON-based persistence
* Custom detection and correlation logic

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### AI Layer

* Large Language Model integration (Gemini or fallback logic)

---

## Data Flow

Logs are processed through the following pipeline:

Logs → Ingestion → Detection → Correlation → AI Analysis → Storage → API → Dashboard

---

## Features

* Real-time log ingestion
* Detection of brute force and port scanning activity
* Incident correlation based on source IP
* AI-based threat classification and explanation
* REST API for accessing incident data
* Interactive dashboard for visualization

---

## Project Structure

```
backend_python/
  api.py
  ingestion.py
  pipeline.py
  incident_engine.py
  ai_analyzer.py
  storage.py
  reporting.py
  data/incidents.json

src/
  app/
    page.tsx
    incidents/[id]/page.tsx
  components/
    IncidentCard.tsx
  lib/
    api.ts
```

---

## Setup and Execution

### Start Backend

```
cd backend_python
uvicorn api:app --reload
```

### Start Frontend

```
npm install
npm run dev
```

### Start Log Ingestion

```
python -c "from ingestion import stream_alerts; stream_alerts()"
```

### Access Dashboard

```
http://localhost:3000
```

---

## Example Incident

```
{
  "id": "INC-001",
  "source_ip": "192.168.1.10",
  "risk_score": 100,
  "event_count": 3,
  "events": ["brute_force", "port_scan"],
  "analysis": {
    "threat_type": "Brute Force Attack",
    "severity": "High",
    "explanation": "Multiple failed login attempts detected, indicating a brute force attack.",
    "recommended_action": "Block the source IP and enable rate limiting."
  }
}
```

---

## Limitations

* Uses simulated log data rather than live production traffic
* Relies on JSON for storage instead of a database
* Limited support for advanced threat detection rules
* AI analysis may depend on external model availability
* No authentication or access control mechanisms

---

## Future Enhancements

* Integration with SIEM tools such as Wazuh or ELK Stack
* Support for network traffic analysis using Suricata or Zeek
* Real-time streaming using message brokers (e.g., Kafka)
* Threat intelligence enrichment (IP reputation services)
* Automated response mechanisms (blocking, alerting)
* Migration to persistent storage (PostgreSQL, Elasticsearch)
* Role-based access control and user management

---

## Conclusion

This project demonstrates a complete pipeline for transforming raw security logs into structured, actionable intelligence using event processing, correlation, and AI-based analysis.

It reflects practical concepts used in modern security operations, including real-time monitoring, incident aggregation, and decision support systems.

---

## License

This project is intended for educational and demonstration purposes.

---

## Disclaimer

All simulated attacks and activities are conducted in a controlled environment. These techniques should not be used on systems without proper authorization.
