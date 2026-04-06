#!/usr/bin/env python3
"""
Clean expected YAML files by removing dynamic fields that change between runs.

Removes:
- execution blocks (keeps only top-level status)
- Step IDs, timestamps (start_time, end_time, duration)
- Attachment IDs and file_path (keeps file_name and mime_type)
- Empty collections: fields: {}, attachments: [], params: {}, param_groups: [], steps: []
- muted: false (default value)
- message (contains dynamic timestamps and unstable whitespace)
- stacktrace (contains absolute file paths)

Usage:
    python3 clean_expected.py <file1.yaml> [file2.yaml ...]
"""

import re
import sys
import yaml


def normalize_signature(signature: str) -> str:
    """Normalize signature by stripping absolute path prefixes.

    Some reporters (e.g., Jest) include the absolute file path in signatures,
    making them environment-dependent. This function strips everything before
    the relative test path (e.g., 'test::filename.test.js').

    Examples:
        13::users::gda::...::jest::test::file.test.js::suite::name
        → 13::test::file.test.js::suite::name
    """
    # Match pattern: {id}::{absolute_path}::test::{file}
    # Strip absolute path, keep from test directory onwards
    normalized = re.sub(
        r"^(\d[\d-]*::)(?:[a-z0-9_.-]+::)*?(test::[a-z0-9_.-]+\.(?:test|spec)\.\w+::)",
        r"\1\2",
        signature,
    )
    return normalized


def clean_attachment(attachment: dict) -> dict | None:
    """Keep only file_name and mime_type from attachments."""
    if not attachment:
        return None

    cleaned = {}
    if "file_name" in attachment:
        cleaned["file_name"] = attachment["file_name"]
    if "mime_type" in attachment:
        cleaned["mime_type"] = attachment["mime_type"]

    return cleaned if cleaned else None


def clean_step(step: dict) -> dict | None:
    """Recursively clean a test step."""
    if not step:
        return None

    cleaned = {}

    # Keep data block (action, expected_result) - remove input_data if empty
    if "data" in step and step["data"]:
        data = {}
        if "action" in step["data"] and step["data"]["action"]:
            data["action"] = step["data"]["action"]
        if "expected_result" in step["data"] and step["data"]["expected_result"]:
            data["expected_result"] = step["data"]["expected_result"]
        if data:
            cleaned["data"] = data

    # Keep only execution status
    if "execution" in step and step["execution"]:
        execution = {}
        if "status" in step["execution"]:
            execution["status"] = step["execution"]["status"]

        # Clean step-level attachments (moved to execution in JS reporter)
        if "attachments" in step["execution"] and step["execution"]["attachments"]:
            attachments = [
                clean_attachment(a)
                for a in step["execution"]["attachments"]
                if a
            ]
            attachments = [a for a in attachments if a]
            if attachments:
                execution["attachments"] = attachments

        if execution:
            cleaned["execution"] = execution

    # Recursively clean nested steps
    if "steps" in step and step["steps"]:
        nested = [clean_step(s) for s in step["steps"] if s]
        nested = [s for s in nested if s]
        if nested:
            cleaned["steps"] = nested

    return cleaned if cleaned else None


def clean_result(result: dict) -> dict:
    """Clean a single test result, removing dynamic and empty fields."""
    cleaned = {}

    # Keep essential fields
    if "title" in result:
        cleaned["title"] = result["title"]
    if "signature" in result:
        cleaned["signature"] = normalize_signature(result["signature"])
    if "testops_ids" in result and result["testops_ids"]:
        cleaned["testops_ids"] = result["testops_ids"]
    if "status" in result:
        cleaned["status"] = result["status"]

    # Keep fields if non-empty
    if "fields" in result and result["fields"]:
        cleaned["fields"] = result["fields"]

    # Keep params if non-empty
    if "params" in result and result["params"]:
        cleaned["params"] = result["params"]

    # Keep param_groups if non-empty
    if "param_groups" in result and result["param_groups"]:
        cleaned["param_groups"] = result["param_groups"]

    # Keep relations (suite hierarchy)
    if "relations" in result and result["relations"]:
        cleaned["relations"] = result["relations"]

    # Clean steps
    if "steps" in result and result["steps"]:
        steps = [clean_step(s) for s in result["steps"] if s]
        steps = [s for s in steps if s]
        if steps:
            cleaned["steps"] = steps

    # Clean attachments
    if "attachments" in result and result["attachments"]:
        attachments = [clean_attachment(a) for a in result["attachments"] if a]
        attachments = [a for a in attachments if a]
        if attachments:
            cleaned["attachments"] = attachments

    # Keep muted only if true
    if result.get("muted") is True:
        cleaned["muted"] = True

    # Deliberately skip: message, stacktrace, execution block, id

    return cleaned


def clean_expected(data: dict) -> dict:
    """Clean the top-level expected data structure."""
    cleaned = {}

    # Keep run stats
    if "run" in data:
        cleaned["run"] = data["run"]

    # Clean each result
    if "results" in data and data["results"]:
        cleaned["results"] = [clean_result(r) for r in data["results"]]

    return cleaned


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 clean_expected.py <file1.yaml> [file2.yaml ...]")
        sys.exit(1)

    for filepath in sys.argv[1:]:
        with open(filepath, "r") as f:
            data = yaml.safe_load(f)

        if not data:
            print(f"Skipping empty file: {filepath}")
            continue

        cleaned = clean_expected(data)

        with open(filepath, "w") as f:
            yaml.dump(cleaned, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

        print(f"Cleaned: {filepath}")


if __name__ == "__main__":
    main()
