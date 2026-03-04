# TestCafe multi-project example

This example uses `mode: 'testops_multi'` and `testops_multi` config. Use `qase.projects({ PROJ1: [1], PROJ2: [2] }).create()` in `test.meta()` to report a test to multiple projects.

Run: `npm test` (set `QASE_TOKEN` and use real project codes in `qase.config.json`).
