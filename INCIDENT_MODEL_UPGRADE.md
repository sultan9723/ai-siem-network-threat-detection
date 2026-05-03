# Incident Model Upgrade - Event History & Behavior Tracking

## Summary
Enhanced the incident model to track event history and behavior over time while maintaining full backward compatibility with existing APIs and storage.

---

## Changes Made

### 1. Updated `backend_python/incident_engine.py`

**New Features:**
- Added `from datetime import datetime` import for timestamp generation
- Added `event_count` field to track total number of events
- Added `first_seen` field to track when incident was first detected
- Enhanced docstring to document new fields

**New Incident Creation Logic:**
```python
new_incident = {
    # Base fields (existing)
    "id": incident_id,
    "source_ip": source_ip,
    "risk_score": min(100, 50 + added_risk),
    "status": "active",
    
    # Event history (NEW)
    "events": [event_type],
    "event_count": 1,
    "first_seen": timestamp,
    "last_seen": timestamp,
    
    # Backward compatibility (legacy field names)
    "count": 1,
    "created_at": timestamp,
    
    # Analysis metadata
    "analysis": analysis
}
```

**Existing Incident Update Logic:**
- Appends new event type to `events` list
- Increments `count` and syncs to `event_count`
- Updates `last_seen` timestamp
- Updates risk score as before

**Timestamp Handling:**
- Added fallback: `timestamp = alert.get("timestamp") or datetime.utcnow().isoformat() + "Z"`
- Ensures valid timestamps even if alerts don't provide them

### 2. Updated `src/lib/api.ts` (TypeScript Interface)

**New Incident Interface:**
```typescript
export interface Incident {
  id: string;
  source_ip: string;
  risk_score: number;
  status: string;
  
  // Event history tracking
  events: string[];
  event_count: number;
  first_seen: string;
  last_seen: string;
  
  // Backward compatibility (legacy field names)
  count: number;
  created_at: string;
  
  analysis?: IncidentAnalysis;
}
```

---

## Backward Compatibility

✅ **Existing APIs unchanged** - All endpoints work as before
✅ **No breaking changes** - Dual field names (count/event_count, created_at/first_seen)
✅ **JSON storage compatible** - All fields serialize correctly
✅ **Existing incidents work** - Legacy incidents with only count/created_at still function

---

## Example Incident Structure (JSON)

### New Incident (Created)
```json
{
  "id": "INC-001",
  "source_ip": "192.168.1.10",
  "risk_score": 80,
  "status": "active",
  "events": ["brute_force"],
  "event_count": 1,
  "first_seen": "2026-04-30T14:25:00Z",
  "last_seen": "2026-04-30T14:25:00Z",
  "count": 1,
  "created_at": "2026-04-30T14:25:00Z",
  "analysis": { ... }
}
```

### Updated Incident (After New Events)
```json
{
  "id": "INC-001",
  "source_ip": "192.168.1.10",
  "risk_score": 100,
  "status": "active",
  "events": ["brute_force", "port_scan", "brute_force"],
  "event_count": 3,
  "first_seen": "2026-04-30T14:25:00Z",
  "last_seen": "2026-04-30T14:28:15Z",
  "count": 3,
  "created_at": "2026-04-30T14:25:00Z",
  "analysis": { ... }
}
```

---

## Files Modified
1. [backend_python/incident_engine.py](backend_python/incident_engine.py) - Enhanced incident creation/update logic
2. [src/lib/api.ts](src/lib/api.ts) - Updated TypeScript interface

---

## Implementation Benefits

✨ **Event History Tracking** - See complete timeline of threat behavior
✨ **Temporal Analysis** - Duration tracking (first_seen to last_seen)
✨ **Event Classification** - events list enables pattern analysis
✨ **API Compatibility** - No frontend changes needed
✨ **Storage Efficiency** - JSON native format, no database migration needed

