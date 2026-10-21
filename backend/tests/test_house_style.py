"""House style: no em or en dashes in the backend or in what the model writes.

The source scan keeps the dashes out of prompts (they nudge the model into
writing them) and out of messages users read. The helper tests pin down the
post-processing applied to model output before it reaches the user.
"""

from pathlib import Path

import pytest

from app.core.house_style import strip_dashes, strip_dashes_deep
from app.core.prompts import PROCESS_ANALYSIS_SYSTEM_PROMPT

EM = "\N{EM DASH}"
EN = "\N{EN DASH}"

BACKEND = Path(__file__).resolve().parents[1]
REPO = BACKEND.parent
# Backend source plus the design-time prompt and schema files at the repo root.
SCANNED_FILES = [
    *sorted((BACKEND / "app").rglob("*.py")),
    *sorted(REPO.glob("0*_*.py")),
]


def test_no_dashes_in_backend_source():
    offenders = [
        f"{path.relative_to(REPO)}:{number}"
        for path in SCANNED_FILES
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1)
        if EM in line or EN in line
    ]
    assert not offenders, "Em or en dash found (house style):\n" + "\n".join(offenders)


def test_system_prompt_asks_for_no_dashes():
    assert "never use the em dash or the en dash" in PROCESS_ANALYSIS_SYSTEM_PROMPT


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        (f"Manual step {EM} high risk", "Manual step, high risk"),
        (f"re-keying{EM}twice", "re-keying, twice"),
        (f"waits 2{EN}3 days", "waits 2-3 days"),
        (f"one {EN} two", "one, two"),
        (f"a gap {EM} the approver {EM} is missing.", "a gap, the approver, is missing."),
        (f"{EM} first\n{EM} second", "- first\n- second"),
        (f"trailing {EM}", "trailing"),
        (f"before {EM}.", "before."),
        (EM, "N/A"),
        ("plain text, untouched", "plain text, untouched"),
        (f"(`a`, ...) {EM} then", "(`a`, ...), then"),
    ],
)
def test_strip_dashes(raw, expected):
    assert strip_dashes(raw) == expected


def test_strip_dashes_deep_cleans_strings_and_keeps_keys():
    raw = {
        f"key{EM}name": [f"a {EM} b", 3, None, {"inner": f"1{EN}2"}],
        "flag": True,
    }
    assert strip_dashes_deep(raw) == {
        f"key{EM}name": ["a, b", 3, None, {"inner": "1-2"}],
        "flag": True,
    }
