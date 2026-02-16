---
phase: 08-bdd-and-collection-examples
plan: 02
subsystem: testing
tags: [newman, postman, api-testing, jsonplaceholder, collection, qase-integration]

# Dependency graph
requires:
  - phase: 08-01
    provides: "CucumberJS BDD example pattern for Phase 8"
provides:
  - "Realistic Newman collection example with JSONPlaceholder API tests"
  - "Postman v2.1 collection with 4 folders and 13 requests"
  - "Data-driven parameterized testing example with data.json"
  - "Newman-Qase integration documentation with features and limitations tables"
affects: [09-cross-cutting]

# Tech tracking
tech-stack:
  added: []
  patterns: [comment-based-qase-annotations, postman-folder-suite-hierarchy, data-driven-parameterization, pre-request-chained-requests]

key-files:
  created:
    - examples/single/newman/api-collection.json
    - examples/single/newman/data.json
  modified:
    - examples/single/newman/package.json
    - examples/single/newman/qase.config.json
    - examples/single/newman/README.md

key-decisions:
  - "Fixed /users/999 to expect 200 (not 404) matching actual JSONPlaceholder behavior"
  - "Default npm test runs without data file for simplicity; test:data provides parameterized variant"
  - "Used autoCollectParams in config to auto-report all data file parameters"

patterns-established:
  - "Newman comment annotations: // qase: N before pm.test() in same exec array"
  - "Newman parameter annotations: // qase.parameters: key1, key2 for selective param reporting"
  - "Collection folder structure provides automatic suite hierarchy in Qase"
  - "Pre-request scripts with pm.sendRequest for chained API call patterns"

# Metrics
duration: 3min
completed: 2026-02-16
---

# Phase 8 Plan 02: Newman Collection Example Summary

**Realistic Postman v2.1 collection with 4 folders (Users/Posts/Error Handling/Advanced) testing JSONPlaceholder API, demonstrating comment-based Qase IDs, parameter annotations, folder suite hierarchy, and data-driven iteration**

## Performance

- **Duration:** 185s (~3 min)
- **Started:** 2026-02-16T12:48:15Z
- **Completed:** 2026-02-16T12:51:20Z
- **Tasks:** 2
- **Files modified:** 5 (3 modified, 2 created)

## Accomplishments
- Replaced synthetic postman-echo.com collection with comprehensive JSONPlaceholder API test collection
- Created 13 requests across 4 organized folders demonstrating all available Newman-Qase integration features
- Added data-driven parameterized testing with data.json (3 iterations with different userId/expectedName)
- Documented all Newman features and limitations with comparison tables in README
- Added autoCollectParams configuration for automatic parameter reporting

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Newman configuration and remove old collection** - `376b028` (chore)
2. **Task 2: Create collection, data file, and update README** - `40378ff` (feat)

## Files Created/Modified
- `examples/single/newman/sample-collection.json` - Deleted (old synthetic postman-echo.com collection)
- `examples/single/newman/api-collection.json` - Created: Postman v2.1 collection with 4 folders, 13 requests, all Qase annotations
- `examples/single/newman/data.json` - Created: 3-row parameter data file for iteration-based testing
- `examples/single/newman/package.json` - Updated: api-collection.json reference, test:data script, reporter upgrade
- `examples/single/newman/qase.config.json` - Updated: added framework.newman.autoCollectParams
- `examples/single/newman/README.md` - Rewritten: collection structure, Qase features/limitations tables, running instructions

## Decisions Made
- Fixed Non-existent user test (/users/999) to expect HTTP 200 with empty object instead of 404, matching actual JSONPlaceholder API behavior verified in Phase 7
- Default `npm test` runs without data file for simplicity; `npm run test:data` provides parameterized variant
- Used autoCollectParams: true in qase.config.json to auto-report all data file parameters when running with -d flag

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed /users/999 error handling test expectations**
- **Found during:** Task 2 (Create collection)
- **Issue:** Plan specified 404 status for /users/999, but JSONPlaceholder actually returns 200 with empty object {} for non-existent resources
- **Fix:** Changed test from expecting 404 to expecting 200, kept empty object assertion. Updated README to say "Verify 200 with empty object" instead of "Verify 404"
- **Files modified:** examples/single/newman/api-collection.json, examples/single/newman/README.md
- **Verification:** Matches verified JSONPlaceholder behavior from Phase 7
- **Committed in:** 40378ff (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential correctness fix. Plan had incorrect JSONPlaceholder behavior assumption for /users/999. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 complete (both CucumberJS and Newman examples done)
- Ready for Phase 9: cross-cutting concerns

## Self-Check: PASSED

All files verified present:
- examples/single/newman/api-collection.json -- FOUND
- examples/single/newman/data.json -- FOUND
- examples/single/newman/package.json -- FOUND
- examples/single/newman/qase.config.json -- FOUND
- examples/single/newman/README.md -- FOUND

All commits verified:
- 376b028 -- FOUND (Task 1)
- 40378ff -- FOUND (Task 2)

---
*Phase: 08-bdd-and-collection-examples*
*Completed: 2026-02-16*
