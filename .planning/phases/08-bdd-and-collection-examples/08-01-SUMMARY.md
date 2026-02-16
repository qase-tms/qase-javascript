---
phase: 08-bdd-and-collection-examples
plan: 01
subsystem: testing
tags: [cucumberjs, bdd, gherkin, jsonplaceholder, qase-reporter, api-testing]

# Dependency graph
requires:
  - phase: 07-api-framework-examples
    provides: JSONPlaceholder API testing patterns and domain knowledge
provides:
  - Realistic CucumberJS BDD example with 4 feature files and 15 scenarios
  - Complete demonstration of all 8 CucumberJS-Qase Gherkin tags
  - Shared step definitions with this.attach() attachment pattern
  - CucumberJS profile-based configuration with cucumberjs-qase-reporter formatter
affects: [08-02-newman, 09-multi-project-examples]

# Tech tracking
tech-stack:
  added: ["@cucumber/cucumber ^11.0.0 (upgraded from ^7.3.2)", "cucumberjs-qase-reporter ^2.2.0"]
  patterns: ["Tag-based Qase metadata via Gherkin tags", "this.attach() for attachments in function() step definitions", "cucumber.js profile config for formatter and require paths", "Scenario Outline with Examples table for native parameterization"]

key-files:
  created:
    - examples/single/cucumberjs/features/api-crud.feature
    - examples/single/cucumberjs/features/api-posts.feature
    - examples/single/cucumberjs/features/api-errors.feature
    - examples/single/cucumberjs/features/api-advanced.feature
    - examples/single/cucumberjs/step_definitions/api_steps.js
    - examples/single/cucumberjs/cucumber.js
  modified:
    - examples/single/cucumberjs/package.json
    - examples/single/cucumberjs/qase.config.json
    - examples/single/cucumberjs/README.md

key-decisions:
  - "Corrected error scenarios to match actual JSONPlaceholder behavior: /users/999 and /posts/999 return 200 with empty {}, not 404"
  - "Added 'response should be an empty object' step definition for corrected error handling scenarios"
  - "Used implicit this properties for World state instead of formal World class for simplicity"

patterns-established:
  - "CucumberJS tag-based metadata: @QaseID, @QaseTitle, @QaseFields, @QaseSuite, @QaseParameters, @QaseGroupParameters, @QaseIgnore"
  - "function() not arrow functions in step definitions for Cucumber World context preservation"
  - "this.attach(content, mimeType) for attachments in step definitions"
  - "cucumber.js profile config for formatter specification and step definition require paths"

# Metrics
duration: 2min 46s
completed: 2026-02-16
---

# Phase 8 Plan 01: CucumberJS BDD Example Summary

**Realistic CucumberJS BDD API tests with 15 scenarios demonstrating all 8 Qase Gherkin tags, this.attach() attachments, and Scenario Outline parameterization against JSONPlaceholder**

## Performance

- **Duration:** 2 min 46 s
- **Started:** 2026-02-16T12:48:09Z
- **Completed:** 2026-02-16T12:50:55Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Replaced synthetic CucumberJS examples with 4 realistic BDD feature files (15 scenarios total) testing JSONPlaceholder API
- Demonstrated all 8 available CucumberJS-Qase tags: @QaseID, @QaseTitle, @QaseFields, @QaseSuite, @QaseParameters, @QaseGroupParameters, @QaseIgnore, plus native Scenario Outline parameterization
- Created shared step definitions with function() context, this.attach() for JSON attachments, assert module, and native fetch
- Upgraded @cucumber/cucumber from ^7.3.2 to ^11.0.0 with profile-based configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Update CucumberJS configuration and remove old files** - `d20c2bb` (chore)
2. **Task 2: Create feature files, step definitions, and update README** - `6786940` (feat)

## Files Created/Modified
- `examples/single/cucumberjs/features/api-crud.feature` - 4 User CRUD scenarios with @QaseID, @QaseTitle, @QaseFields, @QaseSuite
- `examples/single/cucumberjs/features/api-posts.feature` - 3 Post scenarios with Scenario Outline parameterization
- `examples/single/cucumberjs/features/api-errors.feature` - 4 Error handling scenarios with corrected JSONPlaceholder behavior
- `examples/single/cucumberjs/features/api-advanced.feature` - 4 Advanced scenarios with @QaseParameters, @QaseGroupParameters, @QaseIgnore
- `examples/single/cucumberjs/step_definitions/api_steps.js` - Shared step definitions with this.attach(), function(), assert, fetch
- `examples/single/cucumberjs/cucumber.js` - Profile config with cucumberjs-qase-reporter formatter
- `examples/single/cucumberjs/package.json` - Updated deps: @cucumber/cucumber ^11.0.0, cucumberjs-qase-reporter ^2.2.0
- `examples/single/cucumberjs/qase.config.json` - Simplified config with uploadAttachments: true
- `examples/single/cucumberjs/README.md` - Complete documentation with Qase features table and API notes

## Decisions Made
- **Corrected error scenarios:** Plan specified 404 for /users/999 and /posts/999, but JSONPlaceholder actually returns 200 with empty {}. Fixed scenarios to match real API behavior (only /invalid-endpoint truly returns 404).
- **Added empty object step:** Created "response should be an empty object" step definition to support corrected error scenarios (not in original plan).
- **Implicit World state:** Used simple this.baseUrl, this.response, this.responseData properties instead of formal World class for simplicity in examples.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected error feature scenarios for actual JSONPlaceholder behavior**
- **Found during:** Task 2 (Feature file creation)
- **Issue:** Plan specified `/users/999` and `/posts/999` return 404, but JSONPlaceholder actually returns 200 with empty `{}`
- **Fix:** Changed error scenarios to expect status 200 with empty object response instead of 404. Added "response should be an empty object" step definition.
- **Files modified:** `examples/single/cucumberjs/features/api-errors.feature`, `examples/single/cucumberjs/step_definitions/api_steps.js`
- **Verification:** Scenarios match verified JSONPlaceholder API behavior from Phase 7 research
- **Committed in:** 6786940 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential correction for test accuracy. Tests now match actual API behavior. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CucumberJS BDD example complete, ready for Phase 8 Plan 02 (Newman collection example)
- JSONPlaceholder API domain consistent across Phase 7 and Phase 8 examples
- All CucumberJS-Qase integration patterns demonstrated and documented

## Self-Check: PASSED

All 10 files verified present. Both task commits (d20c2bb, 6786940) verified in git history.

---
*Phase: 08-bdd-and-collection-examples*
*Completed: 2026-02-16*
