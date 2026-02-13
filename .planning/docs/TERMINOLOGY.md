# Qase JavaScript Documentation Terminology Guide

This document defines canonical terminology for the Qase JavaScript reporter documentation. Use this guide to maintain consistency across all 9 framework reporters (Jest, Playwright, Cypress, Mocha, Newman, TestCafe, WDIO, CucumberJS, Vitest).

**Machine-readable source:** `.planning/config/terminology.json`

---

## Product Terms

| Term | Definition | Incorrect Variants | Notes |
|------|------------|-------------------|-------|
| **Qase** | The product name | qase, QASE (in prose) | Always capitalize in prose. Lowercase is correct in: code (`qase.id()`), env vars (`QASE_MODE`), package names (`jest-qase-reporter`), imports (`const { qase } = require(...)`). |
| **TestOps** | Qase's test management platform | testops, Testops, test ops, Test Ops | Full product name is "Qase TestOps" (capital T, capital O, no space between Test and Ops). |
| **API token** | Authentication credential for Qase API | api token, Api token, api-token | Uppercase 'API', lowercase 'token'. Two words with space. |

**Rationale:** Product names must be consistent with official branding. Qase and TestOps are proper nouns requiring consistent capitalization. Code contexts follow JavaScript conventions (camelCase, lowercase identifiers).

---

## Technical Terms

| Term | Definition | Incorrect Variants | Notes |
|------|------------|-------------------|-------|
| **test case** | Individual test scenario in Qase TestOps | testcase, test-case | Two words with space. Refers to the entity in Qase that stores test metadata. |
| **test run** | Execution of one or more test cases | testrun, test-run | Two words with space. Represents a test execution session in Qase TestOps. |
| **test case ID** | Numeric identifier for a test case in Qase | case ID, test ID, testcase ID | Full form required. "case ID" is ambiguous (could be use case ID). "test ID" is ambiguous (could be test run ID). |
| **QaseID** | Compound form used in headings | Qase ID, qase id, qaseId | Used in section headings like "## Adding QaseID". In prose, prefer "test case ID". |
| **reporter** | Qase test framework integration package | plugin, extension | Qase packages are "reporters" (e.g., jest-qase-reporter, playwright-qase-reporter). Not "plugins" or "extensions". |
| **qase.config.json** | Qase configuration file | qase.config, config.json, configuration file | Always use full filename when referring specifically to Qase config. Generic "config" requires qualification. |

**Rationale:** Technical terms must match API conventions and avoid ambiguity. "test case ID" clearly distinguishes from "test run ID" or "project code". "reporter" aligns with npm package naming. Compound terms like "test case" follow English conventions (not camelCase in prose).

---

## Documentation Terms

| Term | Definition | Incorrect Variants | Notes |
|------|------------|-------------------|-------|
| **configuration** (prose) | System or file settings | config (in prose) | Prefer "configuration" in documentation prose. "config" is acceptable in: code contexts, filenames (`qase.config.json`), variable names. |

**Rationale:** Documentation uses complete words in prose ("configuration") while code uses abbreviations ("config"). This distinction improves readability without imposing strict rules on code.

---

## Deprecated Terms (Errors)

These terms should NOT be used. Validation tools will flag them as errors.

| Deprecated Term | Replacement | Reason |
|----------------|-------------|--------|
| **reporter plugin** | reporter | Redundant. Qase packages are already reporters. "plugin" adds no value and is inconsistent with package naming (jest-qase-reporter, not jest-qase-reporter-plugin). |
| **Qase plugin** | Qase reporter | Inconsistent with package naming and official documentation. All packages are "reporters". |
| **test ID** | test case ID | Ambiguous. Could mean test case ID, test run ID, or other identifiers. Always qualify. |

---

## Context-Dependent Terms (Warnings)

These terms are acceptable in some contexts, ambiguous in others. Validation tools will flag them as warnings.

| Term | Guidance | Acceptable Contexts | Avoid Contexts |
|------|----------|---------------------|----------------|
| **config** | Prefer "configuration" in prose | Filenames (`qase.config.json`), code (`config.mode`), technical references | Documentation prose, explanatory text |
| **ID** (standalone) | Always qualify the ID type | N/A - always qualify | Standalone usage. Say "test case ID", "run ID", "project code" instead. |

---

## Validation

Use the terminology validation tool to check documentation:

```bash
# Validate single framework
node .planning/tools/validate-terminology.js qase-jest/

# Validate all frameworks
node .planning/tools/validate-terminology.js qase-*/

# Validate single file
node .planning/tools/validate-terminology.js qase-jest/README.md
```

**Exit codes:**
- `0` - No errors found (warnings allowed)
- `1` - Deprecated terms found (errors)
- `2` - Script error

---

## Updates

When adding new terminology rules:

1. Update `.planning/config/terminology.json` (machine-readable source)
2. Update this document (human-readable reference)
3. Run validation across all frameworks to verify impact
4. Document decision in `.planning/STATE.md` key decisions

---

## Examples

### ✅ Correct Usage

- "Link your automated tests to test cases in Qase by specifying the test case ID."
- "Configure the reporter using `qase.config.json` or environment variables."
- "Install the Jest reporter: `npm install jest-qase-reporter`"
- "The Qase TestOps platform provides comprehensive test analytics."
- "Set your API token in the configuration file."

### ❌ Incorrect Usage

- "Link your automated tests using the Qase plugin." (Use "Qase reporter")
- "Specify the test ID in your test." (Use "test case ID")
- "Configure the reporter plugin in your config." (Use "reporter" and "configuration")
- "The testops platform provides analytics." (Use "TestOps")
- "Install the qase reporter." (Use "Qase reporter" in prose)

---

**Last updated:** 2026-02-13
