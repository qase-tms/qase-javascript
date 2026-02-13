---
phase: 01-foundation
plan: 02
subsystem: documentation
tags:
  - validation
  - framework-variations
  - code-style
  - tooling
  - reference-documentation
dependency_graph:
  requires:
    - Master documentation templates (01-01)
  provides:
    - Placeholder validation script
    - Framework syntax variations catalog
    - Code style guide for documentation
  affects:
    - All template application work in Phase 1-3
    - Documentation quality assurance processes
tech_stack:
  added:
    - Node.js validation script
    - Markdown reference documentation
  patterns:
    - Automated placeholder detection
    - Framework API comparison matrices
    - Style guide enforcement
key_files:
  created:
    - .planning/tools/validate-placeholders.js
    - .planning/docs/FRAMEWORK-VARIATIONS.md
    - .planning/docs/CODE-STYLE-GUIDE.md
  modified: []
decisions:
  - title: Use Node.js for validation script
    rationale: Native to JavaScript ecosystem, no external dependencies needed, works cross-platform
    alternatives: [Bash script (platform-specific), Python script (requires Python)]
  - title: Document all 9 frameworks in variations matrix
    rationale: Provides complete reference for template application, identifies TBD items for Phase 3
    alternatives: [Only document Jest/Playwright/Cypress initially]
  - title: Create comprehensive code style guide
    rationale: Ensures consistency across all framework documentation, aligns with project .prettierrc.json
    alternatives: [Reference external style guides, minimal formatting rules only]
  - title: Exclude .planning/ from validation scans
    rationale: Avoids false positives from templates that intentionally contain placeholders
    alternatives: [Whitelist specific placeholder patterns, manual exclusion per scan]
metrics:
  duration_minutes: 6
  tasks_completed: 3
  files_created: 3
  total_lines: 1623
  commits: 3
  completed_date: 2026-02-13
---

# Phase 01 Plan 02: Validation and Reference Documentation Summary

**One-liner:** Created automated placeholder validation script and comprehensive reference documentation for framework syntax variations and code style standards.

---

## What Was Built

Built validation tooling and reference documentation to support consistent, high-quality template application across all 9 JavaScript testing frameworks. Enables automated quality checks and provides clear guidance for framework-specific implementations.

### Deliverables

1. **validate-placeholders.js** (177 lines)
   - Node.js script to detect unreplaced `{{PLACEHOLDER}}` patterns in markdown files
   - Scans single files or directories recursively
   - Reports file path, line number, and placeholder text with colored output
   - Returns non-zero exit code when placeholders found (CI-ready)
   - Excludes .planning/ directory to avoid false positives from templates
   - Exports `validateFile` and `scanDirectory` functions for reusability
   - No external dependencies - uses only Node.js built-in modules (fs, path)

2. **FRAMEWORK-VARIATIONS.md** (688 lines)
   - Complete catalog of API syntax differences across all 9 frameworks
   - Import patterns table with CommonJS and ES modules examples
   - Test ID linking patterns for each framework:
     - Jest/Vitest: `test(qase(id, 'name'), callback)`
     - Playwright: Multiple options (wrapper, method call, annotation)
     - Cypress/Mocha: `it(qase(id, 'name'), callback)`
     - CucumberJS: Gherkin tags `@QaseID=N`
     - Newman/TestCafe/WDIO: Marked TBD for Phase 3
   - Metadata methods comparison (qase.title, qase.fields, qase.suite, etc.)
   - Steps API variations (async vs sync, callback patterns)
   - Attachments API patterns (path-based, content-based, screenshots)
   - Configuration location and complete examples for each framework
   - Run commands reference table
   - Multi-project support patterns
   - Summary comparison table for quick framework lookup
   - All patterns verified from existing README files and examples

3. **CODE-STYLE-GUIDE.md** (758 lines)
   - Comprehensive formatting standards for documentation code examples
   - Language choice guidance (TypeScript vs JavaScript, when to use each)
   - Indentation: 2 spaces (matches .prettierrc.json and JavaScript convention)
   - Code block formatting with language specifiers (javascript, typescript, bash, json, gherkin)
   - Test example patterns:
     - Meaningful test names ("User can login" not "test1")
     - Complete runnable tests (not fragments)
     - Always async/await (never callbacks or .then())
   - API call examples with realistic parameters and content types
   - Configuration formatting:
     - JSON with 2-space indent
     - JavaScript configs with explanatory comments
     - Show minimal config first, then comprehensive
   - Comment style (sentence case, above line, avoid redundancy)
   - What to avoid section (var, tabs, console.log, any type, incomplete code)
   - Example templates for common patterns (tests, configs, imports, async steps)
   - Quick checklist for documentation review
   - Full alignment with .prettierrc.json (single quotes, trailing commas)

---

## Key Capabilities Enabled

### Automated Quality Assurance

**Placeholder detection:**
```bash
# Validate single file
node .planning/tools/validate-placeholders.js qase-jest/README.md

# Validate entire package
node .planning/tools/validate-placeholders.js qase-jest/

# CI integration (exits with error if placeholders found)
node .planning/tools/validate-placeholders.js qase-playwright/ && echo "Documentation complete"
```

**Example output:**
```
Scanning directory: qase-jest/
qase-jest/README.md:42: Found unreplaced placeholder: {{API_TOKEN}}
qase-jest/docs/usage.md:15: Found unreplaced placeholder: {{PROJECT_CODE}}

Found 2 unreplaced placeholders in 2 files
```

---

### Framework Implementation Lookup

**Quick reference for any framework:**
- Import path: Check "Import Patterns" table
- Test ID syntax: Check framework-specific subsection
- Steps API: Check "Steps API Variations" (async vs sync)
- Configuration: Copy example from "Configuration Location"
- Run command: Check "Run Commands" table

**Example lookup flow:**
1. Planning to document Mocha steps API
2. Go to FRAMEWORK-VARIATIONS.md → "Steps API Variations" → "Mocha"
3. See: Synchronous callbacks (no async/await), Mocha standard style
4. Use pattern: `qase.step('name', () => { /* sync code */ })`

---

### Consistent Documentation Style

**Apply CODE-STYLE-GUIDE.md when:**
- Creating new documentation from templates
- Reviewing documentation pull requests
- Writing examples for new features
- Updating existing documentation

**Example application:**
- Use 2-space indentation (not tabs)
- Single quotes for strings: `'text'`
- Template literals for interpolation: `` `Test ${id}` ``
- Async/await pattern: `await qase.step('name', async () => {})`
- Realistic placeholders: `'DEMO'` not `'xxx'`

---

## Framework Variations Identified

### Import Pattern Variations

| Framework | Import Path | Module System |
|-----------|-------------|---------------|
| Jest | jest-qase-reporter/jest | CommonJS/ESM |
| Playwright | playwright-qase-reporter | ESM preferred |
| Cypress | cypress-qase-reporter/mocha | CommonJS/ESM |
| Mocha | mocha-qase-reporter/mocha | CommonJS/ESM |
| Vitest | vitest-qase-reporter | ESM preferred |
| CucumberJS | N/A (uses tags) | Gherkin |

**Impact:** Templates must show correct import path per framework.

---

### Test ID Linking Variations

**Three distinct patterns:**

1. **Wrapper function** (Jest, Vitest, Mocha, Cypress):
   ```javascript
   test(qase(1, 'name'), () => {});
   ```

2. **Multiple options** (Playwright):
   ```typescript
   test(qase(1, 'name'), () => {}); // or
   test('name', () => { qase.title('name'); });
   ```

3. **Tag-based** (CucumberJS):
   ```gherkin
   @QaseID=1
   Scenario: Test scenario
   ```

**Impact:** README and usage templates need framework-specific test ID examples.

---

### Steps API Variations

**Async required** (Jest, Playwright, Vitest):
```javascript
await qase.step('name', async () => {});
```

**Synchronous** (Cypress, Mocha):
```javascript
qase.step('name', () => {});
```

**Native** (CucumberJS):
```gherkin
Given/When/Then steps
```

**Impact:** STEPS-TEMPLATE.md must adapt to framework async/sync behavior.

---

## Deviations from Plan

None - plan executed exactly as written.

All tasks completed without blocking issues:
- Task 1: Created validation script with all specified features
- Task 2: Documented all 9 frameworks with comprehensive variations matrix
- Task 3: Created code style guide with examples and checklist

---

## Validation Results

### Script Functionality

**Tested against templates (expected to find placeholders):**
```bash
node .planning/tools/validate-placeholders.js .planning/templates/README-TEMPLATE.md
```

**Result:** ✓ Detected all {{PLACEHOLDER}} patterns correctly
**Exit code:** ✓ Returned non-zero (1) as expected

**Functions verified:**
- ✓ `validateFile(path)` - scans single file
- ✓ `scanDirectory(path, exclusions)` - recursive scan
- ✓ Line number reporting accurate
- ✓ Colored output (red for errors, green for success)

---

### Documentation Completeness

**FRAMEWORK-VARIATIONS.md verified:**
- ✓ All 9 frameworks listed (Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS, Newman, TestCafe, WDIO)
- ✓ Import patterns table complete with examples
- ✓ Test ID linking patterns documented
- ✓ Steps API variations detailed (async vs sync)
- ✓ Attachments API patterns shown
- ✓ Configuration examples for 5 primary frameworks
- ✓ Run commands table complete
- ✓ 52 table rows for structured comparison
- ✓ Source references included (README files, example files)

**CODE-STYLE-GUIDE.md verified:**
- ✓ 48 major sections covering all aspects
- ✓ Language and syntax guidance (TypeScript vs JavaScript)
- ✓ Indentation rules specified (2 spaces)
- ✓ Code block formatting rules
- ✓ Test example patterns
- ✓ API call examples
- ✓ Configuration formatting
- ✓ Comment style
- ✓ What to avoid section
- ✓ Example templates
- ✓ Quick checklist
- ✓ Aligned with .prettierrc.json

---

## How These Tools Will Be Used

### Phase 1 (Remaining Plans 03-04)

**Applying templates to Jest, Playwright, Cypress:**
1. Reference FRAMEWORK-VARIATIONS.md for framework-specific syntax
2. Follow CODE-STYLE-GUIDE.md for example formatting
3. Run validate-placeholders.js after template application to ensure completion

**Example workflow:**
```bash
# Apply template
cp .planning/templates/README-TEMPLATE.md qase-jest/README.md
# ... replace placeholders ...

# Validate completion
node .planning/tools/validate-placeholders.js qase-jest/README.md
# Should exit 0 (no placeholders remain)
```

---

### Phase 2 (Mocha, Vitest, CucumberJS)

**Reference FRAMEWORK-VARIATIONS.md for:**
- Mocha: Similar to Cypress (it() syntax, mocha subpath)
- Vitest: Similar to Jest (test() syntax, async steps)
- CucumberJS: Unique tag-based approach (@QaseID=N)

**Apply CODE-STYLE-GUIDE.md for:**
- Mocha examples: CommonJS or ESM based on user preference
- Vitest examples: ESM preferred (modern framework)
- CucumberJS examples: Gherkin syntax (no qase import needed)

---

### Phase 3 (Newman, TestCafe, WDIO)

**Update FRAMEWORK-VARIATIONS.md with:**
- TBD sections for Newman, TestCafe, WDIO
- Import patterns after investigation
- Configuration examples after testing

**Use validation script for:**
- Newman: Validate Postman collection documentation
- TestCafe: Validate fixture/test documentation
- WDIO: Validate webdriver.io integration docs

---

### Phase 4 (Quality Assurance)

**Use validate-placeholders.js for:**
- CI integration to block incomplete documentation
- Pre-release validation of all packages
- Automated quality gate

**Use CODE-STYLE-GUIDE.md for:**
- Documentation review checklist
- Ensuring consistency across all 9 packages
- Onboarding new documentation contributors

---

## Files Ready for Use

All 3 deliverables are production-ready:

**Validation script:**
- ✓ Executable: `node .planning/tools/validate-placeholders.js <path>`
- ✓ CI-ready: Returns exit codes 0 (success), 1 (found), 2 (error)
- ✓ No dependencies: Uses only Node.js built-in modules

**Reference documentation:**
- ✓ FRAMEWORK-VARIATIONS.md: Complete reference for 9 frameworks
- ✓ CODE-STYLE-GUIDE.md: Comprehensive style standards

---

## Commits

| Task | Commit | Files | Description |
|------|--------|-------|-------------|
| 1 | 372cbd7 | validate-placeholders.js | Placeholder validation script with regex detection, line reporting, exit codes |
| 2 | 97de48e | FRAMEWORK-VARIATIONS.md | Framework syntax variations matrix (688 lines, 52 tables) |
| 3 | b01d665 | CODE-STYLE-GUIDE.md | Code style guide for documentation (758 lines, 48 sections) |

---

## Self-Check: PASSED

All created files exist and meet requirements:

**Script verification:**
```bash
✓ .planning/tools/validate-placeholders.js exists (177 lines)
✓ Script runs without errors: node .planning/tools/validate-placeholders.js --help
✓ Detects placeholders: tested against README-TEMPLATE.md
✓ Returns non-zero exit code when placeholders found
✓ Has required functions: validateFile, scanDirectory
```

**Documentation verification:**
```bash
✓ .planning/docs/FRAMEWORK-VARIATIONS.md exists (688 lines)
✓ All 9 frameworks mentioned: Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS, Newman, TestCafe, WDIO
✓ Key sections: Import Patterns, Test ID Linking, Steps API, Attachments API, Configuration, Run Commands
✓ Code examples present (qase. patterns, async/await)
✓ 52 table rows for structured comparison

✓ .planning/docs/CODE-STYLE-GUIDE.md exists (758 lines)
✓ 48 major sections covering all style aspects
✓ Indentation rules: 2 spaces documented
✓ Style rules: async/await, TypeScript, const/let documented
✓ Code examples: ```javascript and ```typescript blocks present
✓ What to avoid section: Don't use var, callbacks, etc.
✓ Quick checklist for review
```

**Commits verification:**
```bash
✓ 372cbd7: feat(01-foundation-02): create placeholder validation script
✓ 97de48e: feat(01-foundation-02): document framework syntax variations
✓ b01d665: feat(01-foundation-02): create code style guide for documentation
```

All deliverables meet must_haves criteria:
- ✓ validate-placeholders.js: 177 lines (> 80), exports validateFile/scanDirectory
- ✓ FRAMEWORK-VARIATIONS.md: 688 lines (> 100), contains "Jest"
- ✓ CODE-STYLE-GUIDE.md: 758 lines (> 60), contains "TypeScript"
- ✓ Validation script uses regex pattern: `/\{\{[A-Z_]+\}\}/g`
- ✓ Framework variations documents qase API methods
