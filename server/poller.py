"""Poller: monitors task queue and executes via Claude CLI."""
import subprocess
import requests
import time
import sys
import os
import signal
import logging
from datetime import datetime

API_BASE = os.environ.get("API_BASE", "http://localhost:8080")
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "30"))
PROJECT_DIR = os.environ.get("PROJECT_DIR", str(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
))
TASK_TIMEOUT = int(os.environ.get("TASK_TIMEOUT", "600"))  # 10 minutes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [poller] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

running = True


def signal_handler(sig, frame):
    global running
    log.info("Shutting down...")
    running = False


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


# Map categories to Claude prompts with context
CATEGORY_PREFIX = {
    "calendar": "Google Calendarを確認してください。",
    "tasks": "Google Tasksを確認してください。",
    "mail": "Gmailを確認してください。",
    "research": "以下について調査してください。",
    "dev": "以下の開発タスクを実行してください。",
    "general": "",
}


def poll_once() -> bool:
    """Poll for one task, execute it, report result. Returns True if a task was processed."""
    try:
        resp = requests.get(f"{API_BASE}/api/tasks/poll", timeout=10)
        if resp.status_code != 200:
            log.warning(f"Poll failed: HTTP {resp.status_code}")
            return False

        task = resp.json()
        if task is None:
            return False

        task_id = task["id"]
        command = task["command"]
        category = task.get("category", "general")

        log.info(f"Task #{task_id}: [{category}] {command[:60]}")

        # Build the prompt with category context
        prefix = CATEGORY_PREFIX.get(category, "")
        full_prompt = f"{prefix}\n{command}".strip() if prefix else command

        # Execute via Claude CLI
        try:
            result = subprocess.run(
                ["claude", "-p", full_prompt, "--project", PROJECT_DIR],
                capture_output=True,
                text=True,
                timeout=TASK_TIMEOUT,
                cwd=PROJECT_DIR,
            )

            if result.returncode == 0:
                log.info(f"Task #{task_id}: completed ({len(result.stdout)} chars)")
                report_result(task_id, "completed", result=result.stdout)
            else:
                log.warning(f"Task #{task_id}: failed (exit {result.returncode})")
                report_result(
                    task_id, "failed",
                    result=result.stdout or None,
                    error=result.stderr or f"Exit code: {result.returncode}",
                )

        except subprocess.TimeoutExpired:
            log.warning(f"Task #{task_id}: timeout after {TASK_TIMEOUT}s")
            report_result(task_id, "failed", error=f"Timeout after {TASK_TIMEOUT} seconds")

        return True

    except requests.ConnectionError:
        log.warning("Cannot connect to API server")
        return False
    except Exception as e:
        log.error(f"Unexpected error: {e}")
        return False


def report_result(task_id: int, status: str, result: str = None, error: str = None):
    """Report task execution result back to the API."""
    try:
        requests.patch(
            f"{API_BASE}/api/tasks/{task_id}/result",
            json={"status": status, "result": result, "error": error},
            timeout=10,
        )
    except Exception as e:
        log.error(f"Failed to report result for task #{task_id}: {e}")


def main():
    log.info(f"Starting poller (interval={POLL_INTERVAL}s, project={PROJECT_DIR})")
    log.info(f"API: {API_BASE}")

    while running:
        task_found = poll_once()
        if not task_found:
            # No task found, wait before next poll
            for _ in range(POLL_INTERVAL):
                if not running:
                    break
                time.sleep(1)
        # If a task was found and completed, immediately check for more


if __name__ == "__main__":
    main()
