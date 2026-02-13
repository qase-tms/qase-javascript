---
phase: 02-core-documentation
plan: 03
subsystem: vitest-cucumberjs-docs
tags: [documentation, templates, vitest, cucumberjs, esm, gherkin, bdd]
completed: 2026-02-13

dependencies:
  requires:
    - 01-03-PLAN.md # Template usage guide
    - README-TEMPLATE.md
    - usage-TEMPLATE.md
    - PLACEHOLDER-REFERENCE.md
    - FRAMEWORK-VARIATIONS.md
    - CODE-STYLE-GUIDE.md
  provides:
    - qase-vitest/README.md # Complete Vitest documentation
    - qase-vitest/docs/usage.md # Complete Vitest usage guide
    - qase-cucumberjs/README.md # Complete CucumberJS documentation
    - qase-cucumberjs/docs/usage.md # Complete CucumberJS usage guide
  affects:
    - qase-vitest package (documentation only)
    - qase-cucumberjs package (documentation only)

tech_stack:
  added: []
  patterns:
    - ESM-first imports for Vitest
    - Jest-compatible API wrapper pattern
    - Gherkin tag-based test case linking
    - Native Given/When/Then step mapping
    - BDD-specific Before/After hooks

key_files:
  created:
    - qase-vitest/README.md # 245 lines, ESM patterns
    - qase-vitest/docs/usage.md # 836 lines, 6 troubleshooting items, 5 patterns, 6 use cases
    - qase-cucumberjs/README.md # 256 lines, tag-based patterns
    - qase-cucumberjs/docs/usage.md # 856 lines, 5 troubleshooting items, 4 patterns, 7 use cases
  modified: []

decisions:
  - title: Use ESM import syntax for Vitest examples
    rationale: Vitest is ESM-first, aligns with modern JavaScript
    impact: All Vitest examples use `import` instead of `require`

  - title: Adapt template significantly for CucumberJS
    rationale: CucumberJS uses Gherkin tags, not programmatic API
    impact: Usage patterns fundamentally different from other 8 frameworks

  - title: Document Jest-compatible API for Vitest
    rationale: Eases migration from Jest to Vitest
    impact: Added migration use case and compatibility notes

  - title: Emphasize native Gherkin step mapping for CucumberJS
    rationale: Given/When/Then automatically become Qase steps
    impact: No qase.step() API needed, simpler for BDD users

metrics:
  duration_minutes: 5
  tasks_completed: 2
  files_created: 4
  lines_documented: 2193
  validation_passed: true
---

# Phase 02 Plan 03: Vitest and CucumberJS Documentation Summary

JWT auth with refresh rotation using jose library

## Overview

Applied master documentation templates to Vitest and CucumberJS reporters, creating complete README.md and usage.md files for both frameworks. Vitest documentation emphasizes ESM-first patterns and Jest API compatibility. CucumberJS documentation was significantly adapted for the BDD/Gherkin paradigm, using tag-based test case linking instead of programmatic wrapper functions.

## Accomplishments

### Task 1: Apply Templates to Vitest Reporter

**Completed:** qase-vitest/README.md and qase-vitest/docs/usage.md

**README.md (245 lines):**
- Applied README-TEMPLATE.md structure with full template section order
- Replaced all placeholders with Vitest-specific values
- ESM import patterns: `import { qase } from 'vitest-qase-reporter'`
- vitest.config.ts reporter configuration examples
- Jest-compatible API wrapper: `test(qase(1, 'name'), () => {})`
- Quick start with ESM syntax
- Status mapping table (Passed/Failed/Skipped)
- Run commands including watch mode notes
- Documentation links table

**usage.md (836 lines):**
- Complete API reference for all qase methods
- ESM imports throughout
- Async step examples: `await qase.step('name', async () => {})`
- Parameters with test.each examples
- Troubleshooting section with 6 Vitest-specific errors:
  - ESM module resolution errors
  - vitest.config.ts vs vite.config.ts confusion
  - Watch mode vs run mode reporting
  - Attachments not uploading
  - Results going to wrong test cases
  - TypeScript import errors
- Integration patterns (5 patterns):
  - Vitest workspace support
  - In-source testing with qase
  - Concurrent tests with qase
  - Snapshot testing with qase
  - Using vi.mock with qase reporting
- Common use cases (6 recipes):
  - Report with workspace projects
  - Run in CI with coverage
  - Use concurrent tests for performance
  - Migrate from Jest reporter
  - Dynamic test generation with parameters
  - Test with rich metadata and attachments

**Validation:** All placeholders replaced, validate-placeholders.js exits 0

### Task 2: Apply Templates to CucumberJS Reporter

**Completed:** qase-cucumberjs/README.md and qase-cucumberjs/docs/usage.md

**README.md (256 lines):**
- Applied README-TEMPLATE.md with significant BDD adaptations
- Gherkin tag-based quick start: `@QaseID=1`
- cucumber.js profile configuration examples
- Tag syntax for metadata: `@QaseFields={"severity":"high"}`
- Multiple ID syntax: `@QaseID=1,2,3`
- @QaseIgnore tag for excluding tests
- Status mapping table (Passed/Failed/Pending/Skipped/Undefined/Ambiguous)
- Run commands with `-f cucumberjs-qase-reporter` formatter
- Tag filtering examples
- Documentation links table
- Clear distinction: uses tags, NOT wrapper functions

**usage.md (856 lines):**
- Complete tag-based API reference
- Native Gherkin step mapping documented
- Step definitions with this.attach() examples
- Before/After hook patterns for attachments
- Scenario Outline for parameterization
- Troubleshooting section with 5 BDD-specific errors:
  - Tag parsing errors
  - Step definition not found
  - World object issues
  - Parallel feature execution
  - Attachments not uploading
- Integration patterns (4 patterns):
  - Organizing step definitions by domain
  - Using World objects for state management
  - Before/After hooks with Qase
  - Scenario Outline patterns
  - Tag expressions for filtering
- Common use cases (7 recipes):
  - Tag scenarios for specific Qase projects
  - Attach screenshots in After hook
  - Use Scenario Outline for parameterized testing
  - Filter by @QaseID tags
  - Background steps for common setup
  - Complex test with rich metadata
  - API testing with CucumberJS and Gherkin

**Validation:** All placeholders replaced, validate-placeholders.js exits 0

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | c422386 | feat(02-core-documentation): apply master templates to Vitest reporter |
| 2 | 7573805 | feat(02-core-documentation): apply master templates to CucumberJS reporter |

## Key Insights

### Vitest-Specific Patterns
- **ESM-first:** All examples use `import` syntax, no CommonJS
- **Jest compatibility:** API is identical to Jest reporter (`test(qase(...))`)
- **Modern tooling:** workspace support, in-source testing, concurrent tests
- **Watch mode caveat:** Results only sent on full run completion or exit

### CucumberJS-Specific Patterns
- **Unique paradigm:** Only framework using tag-based (not programmatic) API
- **Native steps:** Given/When/Then automatically mapped to Qase steps
- **Tag syntax:** `@QaseID=N`, `@QaseFields={...}`, `@QaseTitle=...`
- **World pattern:** State management via World objects, not global scope
- **Hook-based attachments:** `this.attach()` in step definitions and hooks

### Template Adaptation Success
- **Vitest:** Template applied with minimal modification (ESM imports only)
- **CucumberJS:** Template significantly adapted for BDD paradigm
- **Consistency maintained:** Both follow same structure, section order
- **Framework uniqueness preserved:** Each showcases its distinct patterns

## Technical Highlights

### Vitest Documentation Quality Improvements
- Added 6 Vitest-specific troubleshooting items (vs 0 in original)
- Added 5 integration patterns (vs 0 in original)
- Added 6 common use cases with complete examples (vs 0 in original)
- Documented ESM module resolution clearly
- Highlighted Jest migration path

### CucumberJS Documentation Quality Improvements
- Clearly distinguished tag-based vs wrapper function approach
- Added 5 BDD-specific troubleshooting items (vs 0 in original)
- Added 4 integration patterns with World objects and hooks
- Added 7 common use cases including API testing
- Documented tag expression filtering comprehensively
- Explained native step mapping (no qase.step() needed)

### Code Style Adherence
- All examples use 2-space indentation
- ESM syntax for Vitest (import/export)
- CommonJS for CucumberJS step definitions (require)
- Gherkin syntax for feature files
- Trailing commas in multiline objects
- Complete, runnable examples (not fragments)
- Meaningful test names and realistic values

## Validation Results

**Vitest:**
```
✓ No unreplaced placeholders found (README.md)
✓ No unreplaced placeholders found (usage.md)
```

**CucumberJS:**
```
✓ No unreplaced placeholders found (README.md)
✓ No unreplaced placeholders found (usage.md)
```

**Framework-specific patterns verified:**
- Vitest: ESM imports, Jest-compatible wrapper, async steps
- CucumberJS: Tag syntax, native step mapping, hook-based attachments

## Impact

### User Experience
- **Vitest users:** Clear ESM examples, Jest migration path documented
- **CucumberJS users:** Tag-based approach clearly explained, BDD patterns showcased
- **Consistency:** Both frameworks follow same documentation structure
- **Discoverability:** Troubleshooting sections address real pain points

### Documentation Quality
- **Comprehensive:** All API methods documented with examples
- **Framework-appropriate:** Vitest shows ESM, CucumberJS shows Gherkin
- **Actionable:** Troubleshooting includes specific solutions
- **Practical:** Use cases demonstrate real-world patterns

### Template System Validation
- **Flexible:** Template adapted successfully for unique CucumberJS paradigm
- **Consistent:** Structure maintained across different API patterns
- **Placeholder system:** All placeholders replaced correctly
- **Validation tooling:** Successfully caught all remaining placeholders

## Next Steps

With 02-03-PLAN.md complete:
- **Phase 02 progress:** 3 of 6 plans complete (Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS done)
- **Next plan:** 02-04-PLAN.md (Newman, TestCafe, WDIO documentation)
- **Remaining frameworks:** 3 (Newman, TestCafe, WDIO)

## Notes

- Vitest documentation emphasizes Jest compatibility for easier migration
- CucumberJS required most significant template adaptation due to tag-based paradigm
- Both frameworks validated successfully with no unreplaced placeholders
- Documentation follows CODE-STYLE-GUIDE.md throughout
- All examples tested against FRAMEWORK-VARIATIONS.md reference

## Self-Check: PASSED

**Files created:**
```
✓ qase-vitest/README.md exists (245 lines)
✓ qase-vitest/docs/usage.md exists (836 lines)
✓ qase-cucumberjs/README.md exists (256 lines)
✓ qase-cucumberjs/docs/usage.md exists (856 lines)
```

**Commits exist:**
```
✓ c422386 found: feat(02-core-documentation): apply master templates to Vitest reporter
✓ 7573805 found: feat(02-core-documentation): apply master templates to CucumberJS reporter
```

**Validation passed:**
```
✓ Vitest README.md: No unreplaced placeholders
✓ Vitest usage.md: No unreplaced placeholders
✓ CucumberJS README.md: No unreplaced placeholders
✓ CucumberJS usage.md: No unreplaced placeholders
```
