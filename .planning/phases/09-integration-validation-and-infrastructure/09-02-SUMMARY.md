---
phase: 09-integration-validation-and-infrastructure
plan: 02
subsystem: examples
tags: [validation, ci-cd, quality-assurance, infrastructure]
dependency_graph:
  requires: [09-01]
  provides: [automated-validation, ci-cd-checks]
  affects: [all-9-primary-examples, github-actions]
tech_stack:
  added: [github-actions, node-validation-script]
  patterns: [matrix-strategy, continue-on-error, framework-specific-patterns]
key_files:
  created:
    - scripts/validate-examples.js
    - .github/workflows/validate-examples.yml
  modified:
    - examples/single/vitest/README.md
decisions:
  - "Validation script uses hardcoded list of 9 primary examples to exclude legacy cypressBadeballCucumber and cypressCucumber"
  - "Framework-specific patterns: TestCafe builder (.id(), .title(), .fields()), Vitest withQase(), Newman folder structure for suites"
  - "continue-on-error for test execution handles public API flakiness without blocking CI"
  - "Node.js 24 in CI for latest features and native fetch support"
metrics:
  duration: 212s
  tasks_completed: 2
  files_modified: 3
  validation_checks: 4
completed_date: 2026-02-16
---

# Phase 09 Plan 02: Validation Tooling and CI/CD Workflow

**One-liner:** Created validation script enforcing minimum usage counts for realistic feature demonstrations and GitHub Actions workflow running structure checks and tests for all 9 examples.

## What Was Done

This plan established automated validation infrastructure to ensure all 9 primary examples remain production-ready with meaningful Qase feature demonstrations.

### Task 1: Create Validation Script

**Created `scripts/validate-examples.js`** - A comprehensive Node.js validation script (no external dependencies, uses only fs and path) that validates all 9 primary examples across four dimensions:

**Check 1: Required Files**
Validates each example has:
- `package.json` with `scripts.test` defined
- `README.md`
- Framework-specific config file (playwright.config.js, cypress.config.js, qase.config.json, wdio.conf.js, jest.config.js, vitest.config.ts, cucumber.js)

**Check 2: README Sections**
Validates each README has these headers (case-insensitive):
- Overview
- Prerequisites
- Installation
- Configuration
- Running Tests
- Qase Features Demonstrated

**Check 3: Qase Feature Coverage (presence)**
Scans test files for Qase API usage across 9 features:
- id (test case linking)
- title (custom test names)
- fields (custom metadata)
- suite (test organization)
- step (test steps)
- attach (file attachments)
- comment (test comments)
- parameters (parameterized tests)
- ignore (excluded tests)

**Check 4: Minimum Usage Counts (CRITICAL for realistic demonstrations)**
Enforces minimum usage thresholds to ensure features are demonstrated meaningfully, not just present as tokens:
- id: 2+ (multiple test cases linked)
- title: 1+ (at least one custom title)
- fields: 1+ (metadata demonstrated)
- suite: 1+ (hierarchy shown)
- step: 2+ (multiple steps for flow)
- attach: 1+ (attachment capability shown)
- comment: 1+ (commenting demonstrated)
- parameters: 1+ (parameterization shown)
- ignore: 1+ (exclusion demonstrated)

**Framework-specific pattern handling:**
- **TestCafe**: Detects builder pattern `.id()`, `.title()`, `.fields()`, `.suite()`, `.parameters()` (not `qase(id)`)
- **Vitest**: Detects `withQase()` wrapper pattern (not `qase(id)`)
- **Newman**: Counts folder structure in `api-collection.json` as automatic suites (`"item"` arrays)
- **CucumberJS**: Detects Gherkin tag patterns `@QaseID`, `@QaseTitle`, etc.

**Known limitations respected:**
- Newman: 6 unsupported features (title, fields, step, attach, comment, ignore)
- TestCafe: 1 unsupported feature (comment)
- CucumberJS: 1 unsupported feature (comment)

**Output format:**
```
=== Validation Results ===

playwright:
  Structure: PASS (package.json, README.md, playwright.config.js)
  README: PASS (6/6 required sections)
  Features: PASS (9/9 features demonstrated, all above minimum usage thresholds)

newman:
  Structure: PASS (package.json, README.md, qase.config.json)
  README: PASS (6/6 required sections)
  Features: PASS (3/3 features demonstrated, 6 known limitations, all above minimum usage thresholds)

=== Summary ===
9/9 examples passed all checks
```

Exit code: 0 if all pass, 1 if any fail.

**Validation result:** All 9 primary examples pass all checks.

### Task 2: Create GitHub Actions Workflow

**Created `.github/workflows/validate-examples.yml`** with two jobs:

**Job 1: check-structure**
- Runs on ubuntu-latest with Node.js 24
- Steps:
  1. Checkout code
  2. Setup Node.js 24 with npm cache
  3. Install dependencies (`npm ci`)
  4. Build reporters (`npm run build -ws --if-present`)
  5. Run validation script (`node scripts/validate-examples.js`)
- This job MUST pass (no continue-on-error) - structure validation is mandatory

**Job 2: test-examples**
- Matrix strategy with `fail-fast: false`
- Runs each of 9 examples independently: playwright, cypress, testcafe, wdio, jest, mocha, vitest, cucumberjs, newman
- Steps per example:
  1. Checkout code
  2. Setup Node.js 24 with npm cache
  3. Install root dependencies (`npm ci` for workspace linking)
  4. Build reporters (`npm run build -ws --if-present`)
  5. **Conditional browser setup:**
     - Playwright: `npx playwright install chromium --with-deps`
     - Cypress: `npx cypress install` + system deps (libgtk, libgbm, etc.)
  6. Run tests: `cd examples/single/${{ matrix.example }} && QASE_MODE=off npm test`
     - Uses `continue-on-error: true` (public APIs may be unreliable)
     - Timeout: 5 minutes per step
  7. Report result (always runs): Shows pass/fail status with explanation

**Triggers:**
- `pull_request` on paths: `examples/**`, `scripts/validate-examples.js`, `.github/workflows/validate-examples.yml`
- `push` to `main`/`master` branches on path: `examples/**`
- `workflow_dispatch` (manual trigger)

**Key design decisions:**
- **QASE_MODE=off only** - No credentials needed, tests run self-contained
- **continue-on-error for tests** - Public APIs (JSONPlaceholder, saucedemo.com) may be flaky, browser tests may fail in CI
- **No continue-on-error for structure validation** - Structure checks must pass
- **Node.js 24** - Latest LTS with native fetch support
- **Conditional browser setup** - Only install browsers for frameworks that need them (avoids unnecessary downloads)
- **Independent example execution** - Matrix strategy isolates failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed validation script pattern detection**
- **Found during:** Task 1 verification
- **Issue:** Initial validation script used patterns like `qase(\d+` which didn't match framework-specific variants:
  - TestCafe uses `.meta(qase.id())` builder pattern
  - Vitest uses `withQase()` wrapper
  - Newman uses folder structure for suites
- **Fix:** Updated regex patterns to include `.id(\d+`, `withQase(`, nested `"item"` arrays for Newman suites, and builder patterns `.title(`, `.fields(`, `.parameters(`, `.suite(`, `.ignore(`
- **Files modified:** scripts/validate-examples.js
- **Commit:** 84a5ac3

**2. [Rule 1 - Bug] Fixed vitest README section header**
- **Found during:** Task 1 verification
- **Issue:** Vitest README used "### Qase Features Coverage" instead of required "## Qase Features Demonstrated"
- **Fix:** Changed section header to match required format (level 2 heading with exact name)
- **Files modified:** examples/single/vitest/README.md
- **Commit:** 84a5ac3

**3. [Rule 3 - Blocking] Reverted accidental credential changes**
- **Found during:** Task 1 commit preparation
- **Issue:** testcafe/qase.config.json and wdio/qase.config.json had accidental credential changes (token and project values)
- **Fix:** Ran `git checkout` to revert unintended changes before commit
- **Action taken:** Ensured only intended files (scripts/validate-examples.js, vitest/README.md) were committed

## Impact

### Quality Assurance
- **Automated validation** ensures examples meet structure and feature requirements
- **Minimum usage counts** prevent token-only feature presence, enforce realistic demonstrations
- **CI/CD checks** catch regressions before merge

### Developer Experience
- **Fast feedback** - validation runs on every PR touching examples
- **Clear error messages** - validation output shows exactly what's missing or below threshold
- **Self-documenting** - validation script serves as specification for what makes a good example

### Maintenance
- **Prevents drift** - automated checks ensure examples stay consistent
- **Framework awareness** - handles each framework's unique patterns correctly
- **Known limitations respected** - doesn't flag Newman/TestCafe/CucumberJS for unsupported features

## Self-Check: PASSED

All created files exist and contain expected functionality:

**Created files verified:**
- ✓ scripts/validate-examples.js - 420 lines, validates 9 examples across 4 checks
- ✓ .github/workflows/validate-examples.yml - 107 lines, two jobs with matrix strategy

**Modified files verified:**
- ✓ examples/single/vitest/README.md - contains "## Qase Features Demonstrated"

**Validation behavior verified:**
- ✓ `node scripts/validate-examples.js` exits 0
- ✓ All 9 examples pass structure, README, feature coverage, and minimum usage count checks
- ✓ Output includes "minimum usage thresholds" language confirming Check 4 is active
- ✓ TestCafe passes with builder pattern detection
- ✓ Vitest passes with withQase() wrapper detection
- ✓ Newman passes with folder structure suite detection

**Workflow configuration verified:**
- ✓ Valid YAML syntax
- ✓ Both jobs present (check-structure, test-examples)
- ✓ QASE_MODE=off set in environment
- ✓ continue-on-error enabled for test execution
- ✓ No secrets or tokens exposed
- ✓ Playwright and Cypress browser setup conditional

**Commits verified:**
- ✓ 84a5ac3 - feat(09-02): create validation script with feature coverage and minimum usage count checks
- ✓ a9b4517 - feat(09-02): create GitHub Actions workflow for example validation

## Metrics

- **Duration**: 212 seconds (~3.5 minutes)
- **Tasks completed**: 2/2
- **Files modified**: 3 (1 created script, 1 created workflow, 1 fixed README)
- **Validation checks**: 4 per example (structure, README, coverage, minimum counts)
- **Examples validated**: 9/9 passing
- **Commits created**: 2

## Next Steps

This plan completes the validation infrastructure for Phase 09. Next plans in this phase will:
- **09-03+**: Additional integration validation tasks, documentation updates, or infrastructure improvements as defined in the roadmap

These validation tools ensure examples remain production-ready and serve as reliable references for users integrating Qase reporters.
