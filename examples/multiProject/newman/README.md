# Newman multi-project example

This example uses `mode: 'testops_multi'` and `testops_multi` config. To map a request to multiple projects, add comments in the test script:

- `// qase PROJ1: 1` — link to case 1 in project PROJ1
- `// qase PROJ2: 2` — link to case 2 in project PROJ2

Legacy single-project `// qase: 222` is still supported.

Run: `npm test` (set `QASE_TOKEN` and use real project codes in `qase.config.json`).
