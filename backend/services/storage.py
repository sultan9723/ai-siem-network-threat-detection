"""Storage module for persisting incident data.

Handles JSON file operations with proper error handling and logging.
"""

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(BASE_DIR, "data", "incidents.json")


def load_incidents() -> list[dict[str, Any]]:
    """Load incidents from JSON file.

    Returns:
        List of incident dictionaries. Empty list if file is invalid.
    """
    if not os.path.exists(FILE):
        logger.debug(f"Incidents file not found: {FILE}")
        return []

    try:
        with open(FILE, "r") as f:
            data = json.load(f)
            logger.info(f"Loaded {len(data)} incidents from storage")
            return data
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {FILE}: {e}", exc_info=True)
        return []
    except IOError as e:
        logger.error(f"Failed to read {FILE}: {e}", exc_info=True)
        return []
    except Exception as e:
        logger.error(f"Unexpected error loading incidents: {e}", exc_info=True)
        return []


def save_incidents(incidents: list[dict[str, Any]]) -> None:
    """Save incidents to JSON file.

    Args:
        incidents: List of incident dictionaries to persist.

    Raises:
        IOError: If file write operation fails.
    """
    try:
        os.makedirs(os.path.dirname(FILE) or ".", exist_ok=True)
        with open(FILE, "w") as f:
            json.dump(incidents, f, indent=2)
        logger.info(f"Saved {len(incidents)} incidents to storage")
    except IOError as e:
        logger.error(f"Failed to write {FILE}: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error saving incidents: {e}", exc_info=True)
        raise
