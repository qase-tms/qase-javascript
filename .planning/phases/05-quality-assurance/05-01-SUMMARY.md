---
phase: 05-quality-assurance
plan: 01
subsystem: validation-tooling
tags: [qa, validation, terminology, links, tooling]
dependency_graph:
  requires: [validate-placeholders.js, extract-code-blocks.js, existing-documentation]
  provides: [terminology-dictionary, terminology-validator, link-validator]
  affects: [plan-05-02]
tech_stack:
  added: [terminology.json-schema, link-validation-algorithm]
  patterns: [zero-dependency-tooling, cli-consistency, ansi-colors]
key_files:
  created:
    - .planning/config/terminology.json
    - .planning/docs/TERMINOLOGY.md
    - .planning/tools/validate-terminology.js
    - .planning/tools/validate-links.js
  modified: []
decisions:
  - Terminology dictionary focused on 9 canonical terms, 3 deprecated, 2 ambiguous (start small, expand later)
  - Strip markdown URLs from prose text to avoid false positives from domain names (e.g., qase.io)
  - Zero npm dependencies for validation tools (consistent with validate-placeholders.js pattern)
  - Warnings for canonical variants and ambiguous terms, errors only for deprecated terms
  - GitHub-compatible anchor slug generation for link fragment validation
metrics:
  duration_minutes: 4
  tasks_completed: 2
  files_created: 4
  files_modified: 0
  commits: 2
  test_results: all-validation-scripts-operational
completed: 2026-02-13
---

# Phase 5 Plan 1: Validation Tooling for Terminology and Links Summary

**One-liner:** Created terminology dictionary with 9 canonical terms and two validation scripts (terminology and links) following zero-dependency CLI pattern for QA infrastructure.

---

## Objective

Built the validation infrastructure needed for QA-01 (terminology consistency) and QA-02 (link validation) by creating a terminology dictionary, human-readable reference guide, and two zero-dependency validation CLI tools.

---

## Tasks Completed

### Task 1: Create Terminology Dictionary and TERMINOLOGY.md Reference
**Commit:** 4d055e8

Created `.planning/config/terminology.json` with three categories:

**Canonical terms (9):**
- Qase (not qase, QASE in prose)
- TestOps (not testops, Testops)
- test case (not testcase, test-case)
- test run (not testrun, test-run)
- test case ID (not case ID, test ID)
- QaseID (compound form for headings)
- qase.config.json (full filename)
- reporter (not plugin, extension)
- API token (not api token, Api token)

**Deprecated terms (3):**
- "reporter plugin" → "reporter"
- "Qase plugin" → "Qase reporter"
- "test ID" → "test case ID"

**Ambiguous terms (2):**
- "config" → prefer "configuration" in prose
- "ID" → always qualify (test case ID, run ID, etc.)

Also created `.planning/docs/TERMINOLOGY.md` as a human-readable reference with:
- Table format with rationale for each term
- Examples of correct/incorrect usage
- Organized by category (Product Terms, Technical Terms, Documentation Terms)
- Validation tool usage instructions

**Key decisions:**
- Dictionary reflects actual terminology patterns found in existing documentation (scanned qase-jest/docs/usage.md, qase-playwright/docs/usage.md, qase-jest/README.md)
- Focused scope: 9 canonical + 3 deprecated + 2 ambiguous terms (not over-engineered)
- Context-aware rules: "config" acceptable in code/filenames, "configuration" preferred in prose

---

### Task 2: Create validate-terminology.js and validate-links.js Scripts
**Commit:** 70b31e0

Created two validation scripts following the established pattern from `validate-placeholders.js`:

**validate-terminology.js:**
- Loads `.planning/config/terminology.json`
- Scans markdown files, skips code blocks (prevents false positives)
- Strips markdown URLs from prose text (prevents false positives from domain names like qase.io)
- Checks deprecated terms (errors), canonical variants (warnings), ambiguous terms (warnings)
- Exit code: 0 if clean, 1 if deprecated terms found, 2 if script error
- Supports `--help` flag, ANSI colors, same CLI pattern as validate-placeholders.js

**validate-links.js:**
- Validates internal file links and anchor fragments
- Resolves relative paths using Node.js path module
- Implements GitHub-compatible anchor slug generation (lowercase, hyphens, alphanumeric only)
- Skips external links (http://, https://, mailto:)
- Validates anchor-only links (#section) against headings in current file
- Validates file links with anchors (file.md#section) against headings in target file
- Exit code: 0 if clean, 1 if broken links found, 2 if script error
- Supports `--help` flag, ANSI colors, same CLI pattern as validate-placeholders.js

**Implementation highlights:**
- Zero npm dependencies (Node.js fs/path only) - consistent with project convention
- Both tools use `findMarkdownFiles` from `extract-code-blocks.js` for file discovery
- Both tools support single file, directory, or glob pattern arguments
- Both tools provide detailed error messages with file:line references

**Validation testing:**
- `validate-terminology.js qase-jest/` found 1 deprecated term ("test ID" in UPGRADE.md) - exit code 1
- `validate-terminology.js qase-playwright/docs/usage.md` found 32 warnings (capitalization, ambiguous terms) - exit code 0
- `validate-links.js qase-jest/README.md` found 1 broken link (../LICENSE) - exit code 1
- `validate-links.js qase-playwright/docs/usage.md` found 0 broken links - exit code 0
- Both tools correctly skip code blocks and handle edge cases

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Strip markdown URLs to prevent false positives**
- **Found during:** Task 2 verification
- **Issue:** Terminology validator flagged "qase" in markdown links like `[Qase TestOps](https://qase.io)` as incorrect capitalization. The URL "qase.io" should be lowercase, but the validator was treating it as prose text.
- **Fix:** Added `stripMarkdownUrls()` function to remove markdown link URLs `(...)` before checking prose text. This preserves link text for validation while excluding URLs.
- **Files modified:** .planning/tools/validate-terminology.js
- **Commit:** 70b31e0 (combined with Task 2)
- **Rationale:** Without this fix, every markdown link to qase.io would trigger a false positive warning. This was a blocking issue for Task 2 completion criteria (scripts must run without crashing and produce meaningful output).

---

## Verification

All success criteria met:

- ✅ Terminology dictionary has canonical, deprecated, and ambiguous categories with real terms from documentation
- ✅ TERMINOLOGY.md provides human-readable reference for maintainers (122 lines)
- ✅ validate-terminology.js detects terminology issues in prose while skipping code blocks
- ✅ validate-links.js detects broken internal file references and anchor fragments
- ✅ Both tools follow validate-placeholders.js CLI conventions (exit codes, colors, help)
- ✅ Zero npm dependencies added (pure Node.js fs/path)

**Validation commands executed:**
```bash
# All 4 files exist
ls .planning/config/terminology.json .planning/docs/TERMINOLOGY.md \
   .planning/tools/validate-terminology.js .planning/tools/validate-links.js

# Terminology dictionary structure verified
cat .planning/config/terminology.json | node -e "..."
# Output: canonical: 9 deprecated: 3 ambiguous: 2

# TERMINOLOGY.md has content
wc -l .planning/docs/TERMINOLOGY.md
# Output: 122

# Both scripts show help and exit 0
node .planning/tools/validate-terminology.js --help
node .planning/tools/validate-links.js --help

# Both scripts run successfully and find real issues
node .planning/tools/validate-terminology.js qase-jest/
# Found 1 deprecated term, exit code 1 (correct)

node .planning/tools/validate-links.js qase-jest/
# Found 1 broken link, exit code 1 (correct)
```

---

## Self-Check: PASSED

**Created files verified:**
```bash
[ -f ".planning/config/terminology.json" ] && echo "FOUND: .planning/config/terminology.json" || echo "MISSING: .planning/config/terminology.json"
# Output: FOUND: .planning/config/terminology.json

[ -f ".planning/docs/TERMINOLOGY.md" ] && echo "FOUND: .planning/docs/TERMINOLOGY.md" || echo "MISSING: .planning/docs/TERMINOLOGY.md"
# Output: FOUND: .planning/docs/TERMINOLOGY.md

[ -f ".planning/tools/validate-terminology.js" ] && echo "FOUND: .planning/tools/validate-terminology.js" || echo "MISSING: .planning/tools/validate-terminology.js"
# Output: FOUND: .planning/tools/validate-terminology.js

[ -f ".planning/tools/validate-links.js" ] && echo "FOUND: .planning/tools/validate-links.js" || echo "MISSING: .planning/tools/validate-links.js"
# Output: FOUND: .planning/tools/validate-links.js
```

**Commits verified:**
```bash
git log --oneline --all | grep -q "4d055e8" && echo "FOUND: 4d055e8" || echo "MISSING: 4d055e8"
# Output: FOUND: 4d055e8

git log --oneline --all | grep -q "70b31e0" && echo "FOUND: 70b31e0" || echo "MISSING: 70b31e0"
# Output: FOUND: 70b31e0
```

All files exist, all commits verified. Self-check PASSED.

---

## Impact

**Immediate:**
- QA infrastructure established for Plan 05-02 (audit and fix terminology/link issues)
- Validation scripts ready for CI integration if needed
- Terminology reference available for documentation maintainers

**For Plan 05-02:**
- Run `validate-terminology.js` across all 9 frameworks to generate audit report
- Run `validate-links.js` across all 9 frameworks to identify broken links
- Fix issues found (terminology inconsistencies, broken links)
- Re-run validators to confirm fixes

**For Phase 5:**
- Establishes consistent validation patterns for future QA tools
- Terminology dictionary can be expanded with additional terms as needed
- Link validator can be extended for external link checking (currently skips external URLs)

---

## Next Steps

1. Execute Plan 05-02: Run validators across all 9 frameworks
2. Generate audit report with all terminology and link issues
3. Fix issues found (update documentation for terminology, fix broken links)
4. Re-run validators to confirm all issues resolved
5. Document results in 05-02-SUMMARY.md
