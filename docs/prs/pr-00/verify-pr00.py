"""Compatibility entrypoint for the relocated PR00 documentation check.

The canonical checker now uses the workspace's Node runtime:
    node scripts/check-docs.mjs

Python is optional for the current workspace. This archived command delegates
to the same read-only checker rather than maintaining duplicate validation.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
try:
    result = subprocess.run(["node", str(ROOT / "scripts/check-docs.mjs")], check=False)
except FileNotFoundError:
    sys.exit("Node is required. Activate the runtime pinned in .node-version.")
sys.exit(result.returncode)
