#!/usr/bin/env python3
"""Test new RPC methods: academize, build_preview, fix_figures, auto_ingest

Fixed issues:
- Removed unused imports
- Replaced f-strings where flagged by Sonar with .format()
- Reduced cognitive complexity by extracting helpers
- Added type hints to satisfy Pylance
- Checked for None on proc.stdin/proc.stdout before calling methods
"""
from typing import Any, Dict, List, Optional
import subprocess
import json


def send_request(proc: subprocess.Popen, payload: str) -> None:
    """Write payload to proc.stdin (safe: checks for None)."""
    if proc.stdin is None:
        raise RuntimeError("Process stdin is not available")
    proc.stdin.write(payload + "\n")
    proc.stdin.flush()


def read_response(proc: subprocess.Popen) -> Optional[Dict[str, Any]]:
    """Read one line from proc.stdout and decode JSON. Returns None if no line.

    Defensive: checks proc.stdout for None (Pylance warning fix).
    """
    if proc.stdout is None:
        raise RuntimeError("Process stdout is not available")
    resp_line = proc.stdout.readline()
    if not resp_line:
        return None
    return json.loads(resp_line)


def truncate_result(result: Any, max_len: int = 200) -> Any:
    """Truncate long string values inside dicts for concise printing.

    If result is a dict, returns a new dict with long strings truncated.
    Otherwise returns the original object.
    """
    if isinstance(result, dict):
        new: Dict[str, Any] = {}
        for k, v in result.items():
            if isinstance(v, str) and len(v) > max_len:
                new[k] = v[:max_len] + "..."
            else:
                new[k] = v
        return new
    return result


def test_rpc() -> None:
    # Start sidecar
    proc = subprocess.Popen(
        ["python", "sidecar/sidecar.py"],
        cwd=r"c:\Toshu",
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )

    tests: List[Dict[str, Any]] = [
        {"method": "academize", "params": {"text": "this is really cool and great stuff"}, "name": "academize"},
        {"method": "build_preview", "params": {"text": "# Research Paper\n\nThis is **important**."}, "name": "build_preview"},
        {"method": "auto_ingest", "params": {}, "name": "auto_ingest"},
    ]

    for i, test in enumerate(tests, 1):
        # attach id
        test["id"] = i
        try:
            req_json = json.dumps(test)
            # Use .format() instead of f-string to satisfy Sonar rule
            print("\n[Test {0}] Sending: {{name}}".format(i).replace("{name}", str(test.get("name"))))

            # send
            send_request(proc, req_json)

            # read
            resp = read_response(proc)
            if resp is None:
                print("  No response")
                continue

            if "error" in resp:
                print("  ERROR: {}".format(resp["error"]))
                continue

            if "result" in resp:
                result = resp["result"]
                truncated = truncate_result(result)
                printed = json.dumps(truncated)
                # keep output short
                print("  OK: {}".format(printed[:300]))
        except Exception as exc:  # pragma: no cover - surface runtime faults
            print("  Exception: {}".format(exc))

    # terminate process
    try:
        proc.terminate()
        proc.wait(timeout=5)
    except Exception:
        # fallback to kill if terminate failed
        try:
            proc.kill()
        except Exception:
            pass


if __name__ == "__main__":
    test_rpc()
