#!/usr/bin/env python3
"""
Normalize signatures in generated report JSON files.

Some reporters (e.g., Jest) include absolute file paths in signatures,
making them environment-dependent. This script strips the absolute path
prefix, keeping only the relative test path portion.

Usage:
    python3 normalize_report.py <report-dir>
"""

import json
import os
import re
import sys


def normalize_signature(signature: str) -> str:
    """Strip absolute path prefix from signatures.

    Converts:
        13::users::gda::...::jest::test::file.test.js::suite::name
    To:
        13::test::file.test.js::suite::name
    """
    return re.sub(
        r"^(\d[\d-]*::)(?:[a-z0-9_.-]+::)*?(test::[a-z0-9_.-]+\.(?:test|spec)\.\w+::)",
        r"\1\2",
        signature,
    )


def normalize_result_file(filepath: str) -> None:
    """Normalize signatures in a single result JSON file."""
    with open(filepath, "r") as f:
        data = json.load(f)

    if "signature" in data:
        data["signature"] = normalize_signature(data["signature"])

    with open(filepath, "w") as f:
        json.dump(data, f, indent=4)


def normalize_run_file(filepath: str) -> None:
    """Normalize the run.json summary file (no signatures to fix)."""
    # run.json doesn't contain signatures, nothing to do
    pass


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 normalize_report.py <report-dir>")
        sys.exit(1)

    report_dir = sys.argv[1]
    results_dir = os.path.join(report_dir, "results")

    if not os.path.isdir(results_dir):
        print(f"No results directory found in {report_dir}")
        sys.exit(1)

    count = 0
    for filename in os.listdir(results_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(results_dir, filename)
            normalize_result_file(filepath)
            count += 1

    print(f"Normalized {count} result files in {report_dir}")


if __name__ == "__main__":
    main()
