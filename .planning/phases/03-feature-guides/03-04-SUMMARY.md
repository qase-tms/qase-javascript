---
phase: 03-feature-guides
plan: 04
subsystem: Documentation
tags: [multi-project, newman, testcafe, enhancements, template-completion]
dependency_graph:
  requires: [03-03]
  provides: [complete-multi-project-guides]
  affects: [qase-newman, qase-testcafe, qase-jest, qase-playwright, qase-cypress, qase-mocha, qase-vitest, qase-cucumberjs, qase-wdio]
tech_stack:
  added: []
  patterns: [comment-based-markers, builder-pattern, tag-based-multi-project]
key_files:
  created:
    - qase-newman/docs/MULTI_PROJECT.md
    - qase-testcafe/docs/MULTI_PROJECT.md
  modified:
    - qase-jest/docs/MULTI_PROJECT.md
    - qase-playwright/docs/MULTI_PROJECT.md
    - qase-cypress/docs/MULTI_PROJECT.md
    - qase-mocha/docs/MULTI_PROJECT.md
    - qase-vitest/docs/MULTI_PROJECT.md
    - qase-cucumberjs/docs/MULTI_PROJECT.md
    - qase-wdio/docs/MULTI_PROJECT.md
decisions:
  - decision: Use comment-based markers for Newman multi-project
    rationale: Newman executes Postman collections (JSON) with no programmatic API access
    pattern: "// qase PROJ1: 1"
  - decision: Use builder pattern for TestCafe multi-project
    rationale: TestCafe uses .meta() with builder pattern for all metadata
    pattern: "qase.projects({...}).create()"
  - decision: Preserve Playwright's unique patterns
    rationale: Playwright has multiple approaches (qase.projects(), projectsTitle, annotations)
    preserved: ["qase.projectsTitle()", "annotation-based mapping"]
  - decision: Add complete example sections to all files
    rationale: Users need full test file context, not just snippets
    impact: All 9 files now have 100+ lines with complete examples
metrics:
  duration: 6
  completed_at: "2026-02-13"
  tasks_completed: 2
  files_created: 2
  files_modified: 7
  total_lines_added: 1248
---

# Phase 3 Plan 4: Complete Multi-Project Documentation

**One-liner:** Created Newman and TestCafe multi-project guides with comment/builder patterns, enhanced 7 existing guides with full configuration examples and troubleshooting

## Completed Tasks

### Task 1: Create MULTI_PROJECT.md for Newman and TestCafe

**Status:** ✅ Complete
**Commit:** 5a3fdff
**Files:**
- Created `qase-newman/docs/MULTI_PROJECT.md` (178 lines)
- Created `qase-testcafe/docs/MULTI_PROJECT.md` (208 lines)

**Implementation:**

**Newman:**
- Uses comment-based markers in Postman collection test scripts
- Pattern: `// qase PROJ1: 1` before pm.test() calls
- Multi-project: Multiple comments for multiple projects
- No programmatic API (Newman executes JSON collections)
- Full configuration example with testops_multi mode
- Complete example showing pm.test() with multi-project comments
- Troubleshooting section with 3 subsections

**TestCafe:**
- Uses builder pattern: `qase.projects({ PROJ1: [1], PROJ2: [2] }).create()`
- Must call `.create()` at end to build metadata object
- Pass result to `test.meta(q)` for test metadata
- Can chain with other methods: `qase.id(1).projects({...}).fields({...}).create()`
- Full configuration example with testops_multi mode
- Complete example showing builder pattern with multiple scenarios
- Troubleshooting section with 3 subsections

Both files validated with zero unreplaced placeholders.

### Task 2: Enhance Existing 7 MULTI_PROJECT.md Files

**Status:** ✅ Complete
**Commit:** f70fbf5
**Files Enhanced:**
- qase-jest/docs/MULTI_PROJECT.md
- qase-playwright/docs/MULTI_PROJECT.md
- qase-cypress/docs/MULTI_PROJECT.md
- qase-mocha/docs/MULTI_PROJECT.md
- qase-vitest/docs/MULTI_PROJECT.md
- qase-cucumberjs/docs/MULTI_PROJECT.md
- qase-wdio/docs/MULTI_PROJECT.md

**Enhancements Applied:**

1. **Configuration Section:**
   - Added full JSON configuration examples showing testops_multi structure
   - Included default_project and projects array with API tokens
   - All 7 files now have inline configuration (not just links)

2. **Key Points Section:**
   - Added comparison between single-project and multi-project syntax
   - Shows progression: single ID → multi-project → multiple IDs per project
   - Framework-specific syntax patterns highlighted

3. **Complete Example Section:**
   - Added full test files (30-50 lines each) showing:
     - Multi-project test with 2 projects
     - Multiple case IDs per project
     - Combining multi-project with other Qase methods
     - Single-project test (uses default_project)
     - Test without Qase metadata
   - Real-world test structure with setup, assertions, teardown

4. **Troubleshooting Section:**
   - Expanded to 3 subsections:
     - "Results Not Appearing in All Projects"
     - "Wrong Test Cases Linked"
     - "Default Project Not Working"
   - Each subsection has 3-4 actionable troubleshooting steps

5. **See Also Section:**
   - Links to usage.md (framework usage guide)
   - Links to qase-javascript-commons README (configuration reference)
   - Links to examples/multiProject/{framework}/ (runnable examples)

6. **Framework-Specific Preservation:**
   - **Playwright:** Preserved unique `qase.projectsTitle()` and annotation patterns
   - **Cypress:** Preserved dual pattern (pass test object OR pass title string)
   - **CucumberJS:** Adapted to Gherkin tag-based approach with @qaseid.PROJ(ids)
   - **Vitest:** Uses addQaseProjects() helper (different from other frameworks)

All 7 files validated with zero unreplaced placeholders.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

✅ All 9 MULTI_PROJECT.md files exist
✅ Zero unreplaced {{PLACEHOLDER}} patterns in all files
✅ All 9 files have consistent section ordering
✅ Each file uses correct framework syntax
✅ Configuration example (testops_multi JSON) present in all files
✅ Troubleshooting section with 3 subsections in all files
✅ See Also links present in all files
✅ Newman uses title-based markers (comment pattern)
✅ TestCafe uses builder pattern with .create()

**File size verification:**
- Newman: 178 lines (target: >80) ✅
- TestCafe: 208 lines (target: >80) ✅
- Jest: 172 lines (enhanced from 54)
- Playwright: 197 lines (enhanced from 66)
- Cypress: 197 lines (enhanced from 108)
- Mocha: 174 lines (enhanced from 54)
- Vitest: 167 lines (enhanced from 54)
- CucumberJS: 189 lines (enhanced from 76)
- WDIO: 173 lines (enhanced from 54)

## Technical Insights

### Newman Multi-Project Pattern

Newman's comment-based pattern is unique because Newman executes Postman collection JSON files, not JavaScript test files with programmatic API access. The pattern:

```javascript
// qase PROJ1: 1
// qase PROJ2: 2
pm.test('Test name', function () {
  pm.response.to.have.status(200);
});
```

The reporter parses these comments from the collection JSON before test execution. Multiple comments = multiple projects.

### TestCafe Builder Pattern

TestCafe's builder pattern requires explicit `.create()` call:

```javascript
const q = qase.projects({ PROJ1: [1], PROJ2: [2] }).create();
test.meta(q)('Test name', async (t) => { ... });
```

Without `.create()`, the metadata object is incomplete. The builder pattern allows chaining multiple metadata methods:

```javascript
qase.id(1).projects({...}).fields({...}).parameters({...}).create()
```

### Framework Pattern Summary

| Framework | Pattern | Type |
|-----------|---------|------|
| Jest | `test(qase.projects({...}, 'name'), () => {})` | Wrapper function |
| Playwright | `qase.projects({...})` or `qase.projectsTitle()` | In-test or title |
| Cypress | `it(qase.projects({...}, 'name'), () => {})` | Wrapper function |
| Mocha | `it(qase.projects({...}, 'name'), function () {})` | Wrapper function |
| Vitest | `test(addQaseProjects('name', {...}), () => {})` | Helper function |
| CucumberJS | `@qaseid.PROJ1(1) @qaseid.PROJ2(2)` | Gherkin tags |
| Newman | `// qase PROJ1: 1` | Comment markers |
| TestCafe | `qase.projects({...}).create()` | Builder pattern |
| WDIO | `it(qase.projects({...}, 'name'), async () => {})` | Wrapper function |

## Documentation Quality

All 9 MULTI_PROJECT.md files now provide:

1. **Clear Overview:** Why use multi-project support (3 use cases)
2. **Configuration:** Full JSON example with API tokens per project
3. **Usage Examples:** Framework-specific syntax with code snippets
4. **Key Points:** Single vs multi-project comparison
5. **Default Behavior:** What happens to tests without mapping
6. **Important Notes:** 4 critical points (codes match, mode setting, format, tokens)
7. **Complete Example:** Full test file showing real-world usage
8. **Troubleshooting:** 3 subsections with actionable steps
9. **See Also:** Links to related docs and examples

Users can now:
- Understand multi-project support in <2 minutes
- Copy configuration and adapt to their project
- Copy complete examples and adapt test names/IDs
- Troubleshoot common issues independently

## Self-Check: PASSED

**Created files exist:**
```
FOUND: qase-newman/docs/MULTI_PROJECT.md
FOUND: qase-testcafe/docs/MULTI_PROJECT.md
```

**Modified files exist:**
```
FOUND: qase-jest/docs/MULTI_PROJECT.md
FOUND: qase-playwright/docs/MULTI_PROJECT.md
FOUND: qase-cypress/docs/MULTI_PROJECT.md
FOUND: qase-mocha/docs/MULTI_PROJECT.md
FOUND: qase-vitest/docs/MULTI_PROJECT.md
FOUND: qase-cucumberjs/docs/MULTI_PROJECT.md
FOUND: qase-wdio/docs/MULTI_PROJECT.md
```

**Commits exist:**
```
FOUND: 5a3fdff (Task 1: Create Newman and TestCafe guides)
FOUND: f70fbf5 (Task 2: Enhance 7 existing guides)
```

**Placeholder validation:**
```
ALL 9 FILES: Zero unreplaced placeholders
```

All verifications passed. Plan execution complete.

## Impact Assessment

**Coverage:** 9/9 frameworks (100%) now have complete multi-project documentation

**Before this plan:**
- 7 frameworks had basic MULTI_PROJECT.md (53-108 lines, missing sections)
- 2 frameworks had no MULTI_PROJECT.md (Newman, TestCafe)
- No complete examples
- Limited troubleshooting
- No configuration examples

**After this plan:**
- 9 frameworks have complete MULTI_PROJECT.md (167-208 lines)
- All files have full configuration, examples, troubleshooting
- Consistent structure across all frameworks
- Framework-specific patterns documented

**User impact:**
- Users can configure multi-project reporting in any framework
- Clear troubleshooting reduces support burden
- Complete examples accelerate implementation
- Consistent structure improves discoverability

## Next Steps

Phase 3 Plan 5: Complete remaining feature guides (muting tests, environments, retries)
Phase 3 Plan 6: Final review and validation of all feature guides
