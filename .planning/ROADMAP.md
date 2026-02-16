# Roadmap: Qase JavaScript Reporters

## Milestones

- ✅ **v1.0 Documentation Improvement** - Phases 1-5 (shipped 2026-02-13)
- ✅ **v1.1 Realistic Test Examples** - Phases 6-9 (shipped 2026-02-16)
- 🚧 **v1.2 Report Spec Compliance** - Phases 10-11 (in progress)

## Phases

<details>
<summary>✅ v1.0 Documentation Improvement (Phases 1-5) - SHIPPED 2026-02-13</summary>

### Phase 1: Foundation & Templates
**Goal**: Create consistent documentation foundation
**Plans**: 3 plans

Plans:
- [x] 01-01: Master templates with placeholder system
- [x] 01-02: Validation tooling
- [x] 01-03: Documentation infrastructure

### Phase 2: Core Documentation
**Goal**: Standardized README.md and usage.md for all 9 reporters
**Plans**: 2 plans

Plans:
- [x] 02-01: Core documentation generation
- [x] 02-02: Reporter-specific customization

### Phase 3: Feature Guides
**Goal**: Cross-reporter feature guides
**Plans**: 2 plans

Plans:
- [x] 03-01: ATTACHMENTS.md and STEPS.md
- [x] 03-02: MULTI_PROJECT.md and UPGRADE.md

### Phase 4: Examples & Validation
**Goal**: Working examples and validation tooling
**Plans**: 2 plans

Plans:
- [x] 04-01: Example projects
- [x] 04-02: Validation automation

### Phase 5: Quality Assurance
**Goal**: Documentation quality verification
**Plans**: 1 plan

Plans:
- [x] 05-01: Full QA pass

</details>

<details>
<summary>✅ v1.1 Realistic Test Examples (Phases 6-9) - SHIPPED 2026-02-16</summary>

### Phase 6: E2E Framework Examples
**Goal**: Realistic E2E test suites with page objects
**Plans**: 4 plans

Plans:
- [x] 06-01: Playwright E2E examples (saucedemo.com)
- [x] 06-02: Cypress E2E examples (saucedemo.com)
- [x] 06-03: TestCafe E2E examples (saucedemo.com)
- [x] 06-04: WDIO E2E examples (saucedemo.com)

### Phase 7: API Framework Examples
**Goal**: Realistic API test suites with CRUD operations
**Plans**: 3 plans

Plans:
- [x] 07-01: Jest API examples (JSONPlaceholder)
- [x] 07-02: Mocha API examples (JSONPlaceholder)
- [x] 07-03: Vitest API examples (JSONPlaceholder)

### Phase 8: BDD & Collection Examples
**Goal**: BDD scenarios and API collection examples
**Plans**: 2 plans

Plans:
- [x] 08-01: CucumberJS BDD scenarios
- [x] 08-02: Newman Postman collection

### Phase 9: Integration Validation
**Goal**: Multi-project examples and validation
**Plans**: 1 plan

Plans:
- [x] 09-01: Multi-project updates and validation

</details>

### v1.2 Report Spec Compliance (In Progress)

**Milestone Goal:** Align JS report reporter output with cross-language Qase Report specification

#### Phase 10: Core Spec Alignment
**Goal**: Report output matches spec for file naming, stats model, and result/step serialization
**Depends on**: Nothing (first phase in milestone)
**Requirements**: ROOT-01, ROOT-02, STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, RSLT-01, RSLT-02, STEP-01, STEP-02, XTRA-01
**Success Criteria** (what must be TRUE):
  1. Report writer produces `run.json` file with correct title field matching spec and Python reference
  2. Stats model includes `blocked` and `invalid` fields, excludes non-spec `broken` field, with correct status mapping
  3. Result fields `testops_ids` and `param_groups` serialize with correct names and types per spec
  4. Step data field `input_data` replaces `data`, attachments serialize inside `execution.attachments`, and attachment `size` excluded from output
**Plans**: 2 plans

Plans:
- [ ] 10-01-PLAN.md — Fix report file naming, title, and stats model
- [ ] 10-02-PLAN.md — Result/step serialization transformation for spec compliance

#### Phase 11: Gherkin Format Conversion
**Goal**: Gherkin-type steps converted to TEXT format before report serialization
**Depends on**: Phase 10 (step model must be correct first)
**Requirements**: STEP-03
**Success Criteria** (what must be TRUE):
  1. Gherkin steps automatically convert to TEXT format during report serialization
  2. BDD framework examples (CucumberJS) produce spec-compliant report output with TEXT steps
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 10 -> 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Templates | v1.0 | 3/3 | Complete | 2026-02-13 |
| 2. Core Documentation | v1.0 | 2/2 | Complete | 2026-02-13 |
| 3. Feature Guides | v1.0 | 2/2 | Complete | 2026-02-13 |
| 4. Examples & Validation | v1.0 | 2/2 | Complete | 2026-02-13 |
| 5. Quality Assurance | v1.0 | 1/1 | Complete | 2026-02-13 |
| 6. E2E Framework Examples | v1.1 | 4/4 | Complete | 2026-02-16 |
| 7. API Framework Examples | v1.1 | 3/3 | Complete | 2026-02-16 |
| 8. BDD & Collection Examples | v1.1 | 2/2 | Complete | 2026-02-16 |
| 9. Integration Validation | v1.1 | 1/1 | Complete | 2026-02-16 |
| 10. Core Spec Alignment | v1.2 | 0/2 | Not started | - |
| 11. Gherkin Format Conversion | v1.2 | 0/? | Not started | - |
