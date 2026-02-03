# Cucumber.js multi-project example

This example uses `mode: 'testops_multi'` and `testops_multi` config. Use tags in feature files to map scenarios to multiple projects:

- `@qaseid.PROJ1(1)` — case 1 in project PROJ1
- `@qaseid.PROJ2(2)` — case 2 in project PROJ2

Legacy `@QaseID=1` and `@Q-1` remain for single-project.

Run: `npm test` (set `QASE_TOKEN` and use real project codes in `qase.config.json`).
