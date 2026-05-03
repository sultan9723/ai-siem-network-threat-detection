"""Configuration and logging setup for the application."""

import logging
import logging.handlers
import sys
from pathlib import Path

# Ensure logs directory exists
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

LOG_FILE = LOGS_DIR / "app.log"


def setup_logging(
    level: int = logging.INFO,
    log_file: str | None = None
) -> None:
    """Configure application-wide logging.
    
    Sets up both console and file logging with appropriate formatting.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        log_file: Path to log file (defaults to logs/app.log).
        
    Example:
        >>> setup_logging(logging.DEBUG)
        >>> logger = logging.getLogger(__name__)
        >>> logger.info("Application started")
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Formatter for all handlers
    formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File Handler (with rotation)
    log_path = log_file or str(LOG_FILE)
    try:
        file_handler = logging.handlers.RotatingFileHandler(
            log_path,
            maxBytes=10_000_000,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except Exception as e:
        root_logger.warning(f"Could not setup file logging: {e}")
    
    root_logger.info("=" * 60)
    root_logger.info(f"Logging initialized at level {logging.getLevelName(level)}")
    root_logger.info("=" * 60)


# Constants
INCIDENT_FILE = "data/incidents.json"

# Event type constants to prevent magic strings
EVENT_TYPES = {
    "BRUTE_FORCE": "brute_force",
    "PORT_SCAN": "port_scan",
    "UNKNOWN": "unknown"
}

# Severity levels
SEVERITY_LEVELS = {
    "HIGH": "High",
    "MEDIUM": "Medium",
    "LOW": "Low"
}

# Incident status
INCIDENT_STATUS = {
    "ACTIVE": "active",
    "RESOLVED": "resolved",
    "FALSE_POSITIVE": "false_positive"
}
