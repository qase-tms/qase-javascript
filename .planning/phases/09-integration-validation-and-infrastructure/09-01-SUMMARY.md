---
phase: 09-integration-validation-and-infrastructure
plan: 01
subsystem: examples
tags: [infra, self-containment, documentation, standardization]
dependency_graph:
  requires: []
  provides: [self-contained-examples, consistent-documentation]
  affects: [all-9-primary-examples]
tech_stack:
  added: []
  patterns: [environment-variable-fallback, structured-documentation]
key_files:
  created: []
  modified:
    - examples/single/playwright/package.json
    - examples/single/cypress/package.json
    - examples/single/testcafe/package.json
    - examples/single/wdio/package.json
    - examples/single/jest/package.json
    - examples/single/mocha/package.json
    - examples/single/cucumberjs/package.json
    - examples/single/newman/package.json
    - examples/single/playwright/README.md
    - examples/single/cypress/README.md
    - examples/single/testcafe/README.md
    - examples/single/wdio/README.md
    - examples/single/jest/README.md
    - examples/single/mocha/README.md
    - examples/single/vitest/README.md
    - examples/single/cucumberjs/README.md
    - examples/single/newman/README.md
decisions:
  - "Environment variable fallback pattern ${QASE_MODE:-off} provides self-containment without breaking existing workflows"
  - "Standard README structure improves discoverability while preserving framework-specific personality"
  - "Newman Limitations section documents reporter constraints transparently"
metrics:
  duration: 448s
  tasks_completed: 2
  files_modified: 17
  examples_fixed: 9
completed_date: 2026-02-16
---

# Phase 09 Plan 01: Self-Containment and Documentation Standardization

**One-liner:** Fixed all 9 examples to run with `npm install && npm test` without credentials, and standardized README structure across all frameworks.

## What Was Done

This plan addressed two critical infrastructure issues across all 9 primary example projects:

1. **Self-containment violation** - Examples hardcoded `QASE_MODE=testops` in package.json, causing `npm test` to fail without Qase credentials
2. **Documentation inconsistency** - READMEs used varying section names ("Setup Instructions" vs "Installation" vs "Setup") and were missing key sections

### Task 1: Environment Variable Fallback in Test Scripts

**Problem:** All examples except vitest hardcoded `QASE_MODE=testops` in their test scripts, meaning `npm test` would attempt Qase API calls and fail without credentials. This violated the self-containment requirement.

**Solution:** Changed all test scripts from hardcoded `QASE_MODE=testops` to environment variable fallback `QASE_MODE=${QASE_MODE:-off}`.

**Pattern:**
```json
{
  "scripts": {
    "test": "QASE_MODE=${QASE_MODE:-off} <test-command>"
  }
}
```

This means:
- Default behavior: `npm test` runs with `QASE_MODE=off` (no Qase API calls)
- Override for reporting: `QASE_MODE=testops npm test` enables Qase integration
- Backward compatible: existing CI/CD workflows continue to work

**Examples updated:**
- **Playwright** - 1 script modified
- **Cypress** - 1 script modified
- **TestCafe** - 1 script modified
- **WDIO** - 1 script modified
- **Jest** - 1 script modified
- **Mocha** - 4 scripts modified (test, test:parallel, test:extra, test:extra-parallel)
- **CucumberJS** - 1 script modified
- **Newman** - 2 scripts modified (test, test:data)
- **Vitest** - NOT modified (already had no QASE_MODE hardcoding)

**Verification:**
- No hardcoded `QASE_MODE=testops` remains in any primary example
- 12 total script modifications (Mocha 4 + Newman 2 + 6 single scripts)
- All examples now self-contained for local development

### Task 2: Standardized README Structure

**Problem:** READMEs across examples used inconsistent section naming and structure:
- Some used "Setup Instructions", others "Installation", others "Setup"
- Missing "Overview" sections in 5 examples
- Missing "Project Structure" sections in 6 examples
- Newman lacked "Limitations" section documenting its reporter constraints

**Solution:** Reorganized all 9 READMEs to follow a consistent section structure while preserving each framework's unique content and personality.

**Standard structure:**
```markdown
# {Framework} Example
## Overview
## Prerequisites
## Installation
## Configuration
## Running Tests
## Test Scenarios (or Collection Structure for Newman)
## Qase Features Demonstrated
## {Framework}-Specific Patterns
## Project Structure
## Limitations (Newman only)
## Additional Resources
```

**Key changes per framework:**
- **Playwright**: Renamed "Setup Instructions" → "Installation", moved "Page Object Pattern" → "Project Structure", enhanced Running Tests section
- **Cypress**: Added "Overview" section, renamed "Setup Instructions" → "Installation", added "Project Structure" section, updated Running Tests
- **TestCafe**: Renamed "Setup Instructions" → "Installation", merged "Example Files" → "Test Scenarios", removed "License" section (not needed for examples)
- **WDIO**: Renamed "Setup" → "Installation", enhanced "Project Structure" section, updated Running Tests
- **Jest**: Added "Overview" section, renamed "Setup Instructions" → "Installation", added "Project Structure" section, updated Running Tests
- **Mocha**: Already had good structure, added "Project Structure" section, updated Running Tests
- **Vitest**: Added "Overview" section, renamed "Setup Instructions" → "Installation", added "Project Structure" section, updated Running Tests
- **CucumberJS**: Added "Overview" section, renamed "Setup" → "Installation", added "Project Structure" section, updated Running Tests
- **Newman**: Added "Overview" section, renamed "Setup" → "Installation", added "Project Structure" section, **added "Limitations" section** documenting no fields/attachments/steps/ignore/comments support, updated Running Tests

**Running Tests sections standardized:**
All READMEs now document both modes:
```bash
# Run tests without Qase reporting (default)
npm test

# Run tests with Qase reporting
QASE_MODE=testops npm test
```

**Configuration sections enhanced:**
All READMEs now document environment variables:
- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable (default: off)
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token (required for testops mode)
- `QASE_TESTOPS_PROJECT` - Your Qase project code (required for testops mode)

**Verification:**
- All 9 READMEs have Overview, Prerequisites, Installation, Configuration, Running Tests, Qase Features Demonstrated sections
- Newman has Limitations section documenting reporter constraints
- Project Structure sections added to all examples
- Framework-specific personality and detailed content preserved

## Deviations from Plan

None - plan executed exactly as written.

## Impact

### User Experience
- **Self-containment achieved**: `npm install && npm test` now works without Qase credentials for all examples
- **Consistent documentation**: Users can navigate any example README with predictable section structure
- **Transparency**: Newman limitations are now explicitly documented

### Developer Experience
- **Local development improved**: Default `npm test` runs without Qase API calls (faster, no credentials needed)
- **CI/CD unchanged**: Existing workflows using `QASE_MODE=testops npm test` continue to work

### Documentation Quality
- **Discoverability improved**: Consistent sections make finding information easier
- **Completeness improved**: All examples now have Overview and Project Structure sections
- **Accuracy improved**: Running Tests sections accurately reflect default behavior

## Self-Check: PASSED

All modified files exist and contain expected changes:

**Package.json files verified:**
- ✓ examples/single/playwright/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/cypress/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/testcafe/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/wdio/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/jest/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/mocha/package.json - contains `QASE_MODE:-off` (4 scripts)
- ✓ examples/single/cucumberjs/package.json - contains `QASE_MODE:-off`
- ✓ examples/single/newman/package.json - contains `QASE_MODE:-off` (2 scripts)

**README files verified:**
- ✓ examples/single/playwright/README.md - has standard sections
- ✓ examples/single/cypress/README.md - has standard sections + Overview
- ✓ examples/single/testcafe/README.md - has standard sections
- ✓ examples/single/wdio/README.md - has standard sections
- ✓ examples/single/jest/README.md - has standard sections + Overview
- ✓ examples/single/mocha/README.md - has standard sections
- ✓ examples/single/vitest/README.md - has standard sections + Overview
- ✓ examples/single/cucumberjs/README.md - has standard sections + Overview
- ✓ examples/single/newman/README.md - has standard sections + Overview + Limitations

**Commits verified:**
- ✓ ec1530e - Task 1: QASE_MODE environment fallback (8 package.json files)
- ✓ 99600b5 - Task 2: Standardize README structure (9 README.md files)

## Metrics

- **Duration**: 448 seconds (~7.5 minutes)
- **Tasks completed**: 2/2
- **Files modified**: 17 (8 package.json + 9 README.md)
- **Examples fixed**: 9/9 primary examples
- **Scripts updated**: 12 (across 8 examples)
- **Commits created**: 2

## Next Steps

This plan completes the foundation for Phase 09 (Integration Validation and Infrastructure). Next plans in this phase will:
- **09-02**: Validate all examples run successfully with `npm install && npm test`
- **09-03**: Create GitHub Actions workflow to test all examples on every PR
- **09-04**: Add example verification to CI/CD pipeline

These infrastructure improvements ensure examples remain self-contained and well-documented throughout future development.
