# Roadmap: Qase JavaScript Reporters Documentation

## Overview

This roadmap transforms 9 framework-specific reporters (Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS, Newman, TestCafe, WDIO) from inconsistent documentation into a unified, template-driven system. The approach follows validation-then-scale: establish templates and validation tools in Phase 1, apply to all frameworks in Phase 2-3, then polish with examples and consistency audits in Phase 4-5. Every phase delivers observable improvements that users can immediately experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Templates** - Create master templates and validation infrastructure
- [ ] **Phase 2: Core Documentation** - Apply templates to README and usage.md for all 9 frameworks
- [ ] **Phase 3: Feature Guides** - Add specialized guides (ATTACHMENTS, STEPS, MULTI_PROJECT, UPGRADE)
- [ ] **Phase 4: Examples & Validation** - Validate code examples and establish CI testing
- [ ] **Phase 5: Quality Assurance** - Consistency audit and polish across all documentation

## Phase Details

### Phase 1: Foundation & Templates
**Goal**: Documentation templates and validation tools exist and are proven to work
**Depends on**: Nothing (first phase)
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04, QA-04, EX-03
**Success Criteria** (what must be TRUE):
  1. Master templates exist for README, usage.md, and all feature guides
  2. Placeholder naming convention is documented and includes all common patterns
  3. Template usage guide shows maintainers how to apply templates to new frameworks
  4. Validation script detects unreplaced placeholders in documentation files
  5. Framework variations matrix catalogs syntax differences across all 9 frameworks
  6. Code style guide defines consistent formatting for all examples
**Plans**: 3 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md — Create master templates adapted from Python (README, usage, feature guides) with JavaScript syntax and placeholder reference
- [x] 01-02-PLAN.md — Create validation tooling and document framework variations/code style standards
- [x] 01-03-PLAN.md — Create template usage guide and verify foundation completeness with human checkpoint

### Phase 2: Core Documentation
**Goal**: Every framework has complete README and usage.md following the template
**Depends on**: Phase 1
**Requirements**: README-01, README-02, README-03, README-04, README-05, USAGE-01, USAGE-02, USAGE-03, USAGE-04, USAGE-05, FW-01, FW-02, FW-03, FW-04, FW-05, FW-06, FW-07, FW-08, FW-09
**Success Criteria** (what must be TRUE):
  1. User can install any reporter with single npm command found in README
  2. User can copy minimal working example from README and get first test result
  3. User can find complete API reference for any qase method in usage.md
  4. User can identify framework-specific integration patterns in dedicated sections
  5. User can troubleshoot common errors using documented solutions
  6. User can discover common use cases with goal-oriented recipe examples
  7. All 9 frameworks have structurally identical documentation (same sections, same order)
**Plans**: 5 plans in 2 waves

Plans:
- [ ] 02-01-PLAN.md — Apply templates to Jest and Playwright reporters (README + usage.md)
- [ ] 02-02-PLAN.md — Apply templates to Cypress and Mocha reporters (README + usage.md)
- [ ] 02-03-PLAN.md — Apply templates to Vitest and CucumberJS reporters (README + usage.md)
- [ ] 02-04-PLAN.md — Apply templates to Newman, TestCafe, and WDIO reporters (README + usage.md)
- [ ] 02-05-PLAN.md — Cross-validate structural consistency across all 9 frameworks with human review

### Phase 3: Feature Guides
**Goal**: Specialized capability guides exist for all frameworks
**Depends on**: Phase 2
**Requirements**: GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04
**Success Criteria** (what must be TRUE):
  1. User can attach files, screenshots, and logs using patterns in ATTACHMENTS.md
  2. User can create nested test steps using patterns in STEPS.md
  3. User can configure multiple Qase projects in monorepo using MULTI_PROJECT.md
  4. User can migrate between versions using UPGRADE.md migration paths
  5. Each guide exists in all 9 framework documentation directories
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Examples & Validation
**Goal**: All code examples are validated and tested in CI
**Depends on**: Phase 3
**Requirements**: EX-01, EX-02, EX-03, EX-04, QA-03
**Success Criteria** (what must be TRUE):
  1. All code examples in documentation match working code in examples/ directory
  2. Examples show expected output or behavior where relevant
  3. Examples run successfully in CI for their respective frameworks
  4. Framework-specific syntax is accurately reflected in all examples
  5. No placeholder text remains in any published documentation file
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Quality Assurance
**Goal**: Documentation is consistent, complete, and navigation works perfectly
**Depends on**: Phase 4
**Requirements**: QA-01, QA-02
**Success Criteria** (what must be TRUE):
  1. Consistent terminology used across all 9 reporters (verified against dictionary)
  2. All internal links navigate to correct destinations
  3. All external links resolve successfully
  4. Table of contents matches actual section structure in all usage.md files
  5. Terminology dictionary documents canonical terms for common concepts
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Templates | 3/3 | ✓ Complete | 2026-02-13 |
| 2. Core Documentation | 0/5 | Not started | - |
| 3. Feature Guides | 0/TBD | Not started | - |
| 4. Examples & Validation | 0/TBD | Not started | - |
| 5. Quality Assurance | 0/TBD | Not started | - |
