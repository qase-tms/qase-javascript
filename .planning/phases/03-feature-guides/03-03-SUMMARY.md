---
phase: 03-feature-guides
plan: 03
subsystem: documentation-advanced-features
tags:
  - testcafe
  - wdio
  - cucumberjs
  - newman
  - attachments
  - steps
  - framework-variations
dependency_graph:
  requires:
    - "02-core-documentation (all plans)"
    - ".planning/templates/ATTACHMENTS-TEMPLATE.md"
    - ".planning/templates/STEPS-TEMPLATE.md"
  provides:
    - "qase-testcafe/docs/ATTACHMENTS.md"
    - "qase-testcafe/docs/STEPS.md"
    - "qase-wdio/docs/ATTACHMENTS.md"
    - "qase-wdio/docs/STEPS.md"
    - "qase-cucumberjs/docs/ATTACHMENTS.md"
    - "qase-cucumberjs/docs/STEPS.md"
    - "qase-newman/docs/ATTACHMENTS.md"
    - "qase-newman/docs/STEPS.md"
  affects:
    - "Phase 03 remaining plans (usage.md completion)"
tech_stack:
  added:
    - "TestCafe builder pattern documentation"
    - "WDIO dual-mode (Mocha/Cucumber) documentation"
    - "CucumberJS Gherkin-based documentation"
    - "Newman limitations documentation"
  patterns:
    - "TestCafe: qase.attach({ paths, name, content, type })"
    - "TestCafe: await qase.step(name, async (s) => { await s.step(...) })"
    - "WDIO: Dual mode (Mocha/Jasmine + Cucumber)"
    - "WDIO: disableWebdriverStepsReporting option"
    - "CucumberJS: this.attach(data, mediaType)"
    - "CucumberJS: Gherkin Given/When/Then as native steps"
    - "Newman: No programmatic attachment/step API"
key_files:
  created:
    - path: "qase-testcafe/docs/ATTACHMENTS.md"
      lines: 344
      purpose: "TestCafe attachment guide with builder pattern"
    - path: "qase-testcafe/docs/STEPS.md"
      lines: 331
      purpose: "TestCafe steps guide with nested callback pattern"
    - path: "qase-wdio/docs/ATTACHMENTS.md"
      lines: 415
      purpose: "WDIO attachment guide with dual mode support"
    - path: "qase-wdio/docs/STEPS.md"
      lines: 428
      purpose: "WDIO steps guide with Mocha/Cucumber patterns"
    - path: "qase-cucumberjs/docs/ATTACHMENTS.md"
      lines: 337
      purpose: "CucumberJS attachment guide using native this.attach()"
    - path: "qase-cucumberjs/docs/STEPS.md"
      lines: 359
      purpose: "CucumberJS steps guide explaining Gherkin patterns"
    - path: "qase-newman/docs/ATTACHMENTS.md"
      lines: 131
      purpose: "Newman attachment limitations documentation"
    - path: "qase-newman/docs/STEPS.md"
      lines: 314
      purpose: "Newman steps explanation (pm.test() as tests)"
  modified: []
decisions:
  - decision: "TestCafe uses 'type' parameter instead of 'contentType' for attachments"
    rationale: "Verified from qase-testcafe/src/qase.ts source code"
    impact: "Accurate API documentation matching implementation"
  - decision: "TestCafe nested steps use callback parameter (s, s1, s2) for nesting"
    rationale: "Verified from README.md and examples/testcafe/attachmentTests.js"
    impact: "Clear distinction from other frameworks' qase.step() nesting"
  - decision: "WDIO documents both Mocha/Jasmine and Cucumber modes"
    rationale: "WDIO supports both test frameworks with different patterns"
    impact: "Comprehensive coverage for all WDIO usage patterns"
  - decision: "CucumberJS uses Cucumber's native this.attach() not qase.attach()"
    rationale: "CucumberJS reporter captures Cucumber native attachments automatically"
    impact: "Users understand framework integration approach"
  - decision: "CucumberJS steps are Gherkin Given/When/Then, not qase.step()"
    rationale: "Gherkin steps are automatically mapped to Qase steps by reporter"
    impact: "Clear explanation of how CucumberJS differs from other frameworks"
  - decision: "Newman guides clearly state no programmatic API for attachments/steps"
    rationale: "Postman collections don't support file system or step APIs"
    impact: "Users understand limitations upfront without confusion"
  - decision: "Newman guides kept brief (131 and 314 lines) but informative"
    rationale: "Focus on what IS supported rather than filler content"
    impact: "Honest documentation of capabilities and alternatives"
metrics:
  duration_minutes: 6
  completed_date: "2026-02-13"
  tasks_completed: 2
  files_created: 8
  total_lines: 2659
  validation_passes: 8
---

# Phase 3 Plan 3: Framework-Specific Attachment and Step Guides

**One-liner:** Create ATTACHMENTS.md and STEPS.md guides for TestCafe (builder pattern), WDIO (dual Mocha/Cucumber modes), CucumberJS (Gherkin/native API), and Newman (limitations documentation).

---

## Execution Summary

Successfully created 8 documentation files (ATTACHMENTS.md + STEPS.md) for the 4 frameworks with unique patterns or limitations: TestCafe, WDIO, CucumberJS, and Newman. Each guide accurately documents framework-specific capabilities and limitations without using placeholder content.

**Key achievements:**
- TestCafe guides document builder pattern with `qase.attach({ type })` and nested step callback pattern
- WDIO guides document dual mode support (Mocha/Jasmine + Cucumber) and automatic reporting options
- CucumberJS guides explain Gherkin patterns and Cucumber's native `this.attach()` API
- Newman guides honestly document limitations with alternatives and what IS supported

---

## Tasks Completed

### Task 1: Create ATTACHMENTS.md and STEPS.md for TestCafe and WDIO

**Status:** ✅ Completed

**Files created:**
- `qase-testcafe/docs/ATTACHMENTS.md` (344 lines)
- `qase-testcafe/docs/STEPS.md` (331 lines)
- `qase-wdio/docs/ATTACHMENTS.md` (415 lines)
- `qase-wdio/docs/STEPS.md` (428 lines)

**Verification:**
- ✅ validate-placeholders.js: 0 placeholders in all 4 files
- ✅ All files > 80 lines (344, 331, 415, 428)
- ✅ TestCafe uses builder pattern with `type` parameter (not `contentType`)
- ✅ TestCafe nested steps use callback parameter (s, s1, s2)
- ✅ WDIO documents both Mocha/Jasmine and Cucumber modes
- ✅ Examples verified against source code and working examples

**Commit:** `6c9cdde` — feat(03-03): create ATTACHMENTS.md and STEPS.md for TestCafe and WDIO

---

### Task 2: Create ATTACHMENTS.md and STEPS.md for CucumberJS and Newman

**Status:** ✅ Completed

**Files created:**
- `qase-cucumberjs/docs/ATTACHMENTS.md` (337 lines)
- `qase-cucumberjs/docs/STEPS.md` (359 lines)
- `qase-newman/docs/ATTACHMENTS.md` (131 lines)
- `qase-newman/docs/STEPS.md` (314 lines)

**Verification:**
- ✅ validate-placeholders.js: 0 placeholders in all 4 files
- ✅ CucumberJS ATTACHMENTS.md documents `this.attach()` pattern
- ✅ CucumberJS STEPS.md documents Gherkin Given/When/Then patterns
- ✅ Newman ATTACHMENTS.md clearly states no programmatic attachment support
- ✅ Newman STEPS.md explains `pm.test()` blocks as separate test results
- ✅ No filler content — focuses on what IS supported and alternatives

**Commit:** `af0e4a4` — feat(03-03): create ATTACHMENTS.md and STEPS.md for CucumberJS and Newman

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Key Implementation Details

### TestCafe Patterns

**Attachments:**
- Parameter is `type` not `contentType` (verified from source)
- Paths parameter is an array: `qase.attach({ paths: ['file1', 'file2'] })`
- Step-level attachments use callback parameter: `await qase.step('name', async (s) => { s.attach({...}) })`

**Steps:**
- Nested steps use callback parameter pattern: `await qase.step('parent', async (s1) => { await s1.step('child', ...) })`
- This differs from other frameworks that use `qase.step()` directly for nesting

### WDIO Patterns

**Dual Mode Support:**
- Mocha/Jasmine: Programmatic `qase.attach()` and `qase.step()`
- Cucumber: Native Gherkin steps automatically reported, `this.attach()` for attachments

**Reporter Options:**
- `disableWebdriverStepsReporting`: Controls automatic WebDriver command reporting
- `disableWebdriverScreenshotsReporting`: Controls automatic screenshot attachments
- `useCucumber`: Enable Cucumber-specific integration

### CucumberJS Patterns

**Attachments:**
- Uses Cucumber's native `this.attach(data, mediaType)` method
- No `qase.attach()` import from reporter
- Step definitions must use regular functions (not arrow functions) to preserve `this` context

**Steps:**
- Gherkin Given/When/Then/And steps automatically reported
- No programmatic `qase.step()` API
- Scenario Outlines create separate test runs per Examples row
- Background steps reported for each scenario

### Newman Patterns

**Limitations:**
- No programmatic attachment API (Postman collections don't support file system access)
- No programmatic step API (`pm.test()` blocks are separate test results, not steps)

**What IS Supported:**
- Request/response data automatically captured
- Each `pm.test()` is a separate test result
- Test results include execution metadata
- Iteration data from CSV/JSON files reported as parameters

**Alternatives Documented:**
- Console logging for debugging
- Collection variables for data storage
- Qase API for post-execution attachment upload
- Recommendation to use different framework if attachments/steps are essential

---

## Validation Results

All 8 files passed validation:

```bash
✓ qase-testcafe/docs/ATTACHMENTS.md — 0 placeholders
✓ qase-testcafe/docs/STEPS.md — 0 placeholders
✓ qase-wdio/docs/ATTACHMENTS.md — 0 placeholders
✓ qase-wdio/docs/STEPS.md — 0 placeholders
✓ qase-cucumberjs/docs/ATTACHMENTS.md — 0 placeholders
✓ qase-cucumberjs/docs/STEPS.md — 0 placeholders
✓ qase-newman/docs/ATTACHMENTS.md — 0 placeholders
✓ qase-newman/docs/STEPS.md — 0 placeholders
```

Line counts meet requirements:
- TestCafe: 344 + 331 = 675 lines
- WDIO: 415 + 428 = 843 lines
- CucumberJS: 337 + 359 = 696 lines
- Newman: 131 + 314 = 445 lines
- **Total: 2,659 lines**

---

## Cross-References

### Templates Used
- `.planning/templates/ATTACHMENTS-TEMPLATE.md` — Adapted for each framework's patterns
- `.planning/templates/STEPS-TEMPLATE.md` — Adapted for each framework's patterns

### Source Code Verified
- `qase-testcafe/src/qase.ts` — Verified `type` parameter usage
- `qase-wdio/src/wdio.ts` — Verified dual-mode support
- `examples/single/testcafe/attachmentTests.js` — Verified attachment patterns

### README Files Referenced
- `qase-testcafe/README.md` — Verified step nesting examples
- `qase-wdio/README.md` — Verified dual-mode configuration
- `qase-cucumberjs/README.md` — Verified Gherkin tag patterns
- `qase-newman/README.md` — Verified comment-based ID linking

---

## Self-Check: PASSED

**Files created:**
```bash
✓ FOUND: qase-testcafe/docs/ATTACHMENTS.md
✓ FOUND: qase-testcafe/docs/STEPS.md
✓ FOUND: qase-wdio/docs/ATTACHMENTS.md
✓ FOUND: qase-wdio/docs/STEPS.md
✓ FOUND: qase-cucumberjs/docs/ATTACHMENTS.md
✓ FOUND: qase-cucumberjs/docs/STEPS.md
✓ FOUND: qase-newman/docs/ATTACHMENTS.md
✓ FOUND: qase-newman/docs/STEPS.md
```

**Commits exist:**
```bash
✓ FOUND: 6c9cdde (Task 1: TestCafe and WDIO)
✓ FOUND: af0e4a4 (Task 2: CucumberJS and Newman)
```

All files verified to exist. All commits verified in git history.

---

## Impact Analysis

### Documentation Completeness
- 4 frameworks now have complete ATTACHMENTS.md and STEPS.md guides
- Covers all frameworks with unique patterns (non-standard 5)
- Users understand framework-specific capabilities and limitations

### User Experience
- TestCafe users understand builder pattern and nested step callbacks
- WDIO users understand dual-mode support and configuration options
- CucumberJS users understand Gherkin-native approach
- Newman users understand limitations and alternatives

### Phase 3 Progress
- Plan 03-03 complete
- Ready to proceed with 03-04 (usage.md for remaining frameworks)
- Foundation established for framework-specific advanced features

---

## Next Steps

1. **Plan 03-04:** Complete usage.md for TestCafe, WDIO, CucumberJS, Newman
2. **Plan 03-05:** Create MULTI_PROJECT.md guides for remaining frameworks
3. **Plan 03-06:** Human review and Phase 3 completion validation

---

## Notes

**Framework diversity handled well:**
- TestCafe's unique builder pattern documented accurately
- WDIO's dual-mode support explained clearly
- CucumberJS's Gherkin-centric approach respected
- Newman's limitations documented honestly without filler

**No user confusion expected:**
- Each guide starts with "Overview" explaining the framework's approach
- "Limitations" sections appear prominently when applicable
- Alternatives provided for limitations (Newman)
- Examples verified against working code and source implementations

**Quality maintained:**
- Zero placeholders across all 8 files
- All examples use correct syntax and API patterns
- See Also links point to correct relative paths
- Troubleshooting sections address framework-specific issues
