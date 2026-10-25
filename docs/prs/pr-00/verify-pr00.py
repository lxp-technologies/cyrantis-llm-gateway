"""Read-only PR00 documentation checks; not application/security tests.

Run from any directory: python <repository>/docs/verify-pr00.py
Uses only the Python standard library. External URLs and runtime behavior are
not validated. Input briefs are read for links but never reformatted.
"""
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BRIEFS = {
    "docs/pr-00-discovery-architecture-plan.md",
    "docs/pr-00-adr-update.md",
    "docs/pr-00-finalize.md",
}
REQUIRED = [
    "AGENTS.md", "README.md", ".github/pull_request_template.md",
    "docs/architecture/ARCHITECTURE.md",
    "docs/architecture/decisions/ADR-001-control-gateway-separation.md",
    "docs/security/ACCESS-BOUNDARIES.md", "docs/security/THREAT-MODEL.md",
    "docs/planning/ROADMAP.md", "docs/planning/QUALITY-GATES.md",
    "docs/planning/DEVELOPER-BYOK.md", "docs/planning/PR00-REVIEW.md",
    *sorted(BRIEFS),
]
errors = []
for relative in REQUIRED:
    if not (ROOT / relative).is_file():
        errors.append(f"Missing required file: {relative}")

files = sorted((ROOT / "docs").rglob("*.md"))
files += [ROOT / name for name in (
    "AGENTS.md", "README.md", ".github/pull_request_template.md"
)]
links = 0
authored = 0
for path in files:
    relative = path.relative_to(ROOT).as_posix()
    try:
        content = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        errors.append(f"{relative}: {exc}")
        continue
    if relative not in BRIEFS:
        authored += 1
        if not re.match(r"^#{1,2} ", content):
            errors.append(f"{relative}: missing opening heading")
        if not content.endswith("\n"):
            errors.append(f"{relative}: missing final newline")
        if sum(line.startswith("```") for line in content.splitlines()) % 2:
            errors.append(f"{relative}: unbalanced code fences")
        for number, line in enumerate(content.splitlines(), 1):
            if line.rstrip() != line:
                errors.append(f"{relative}:{number}: trailing whitespace")
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", content):
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
            continue
        links += 1
        if not (path.parent / target.split("#", 1)[0]).exists():
            errors.append(f"{relative}: broken local target {target}")

print(json.dumps({
    "markdown_files": len(files),
    "authored_markdown_files": authored,
    "local_link_targets": links,
    "errors": errors,
    "scope": "UTF-8, required files, headings, fences, whitespace, local link targets",
    "not_checked": "External URLs, Markdown rendering/anchors, runtime/security behavior",
}, indent=2, ensure_ascii=False))
sys.exit(bool(errors))
