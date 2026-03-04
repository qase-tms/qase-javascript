# Multi-Project Examples

This directory contains examples demonstrating how to use Qase TestOps with multiple projects.

## Overview

The multi-project feature allows you to send test results to multiple Qase projects simultaneously, with different test case IDs for each project. This is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Projects Used in Examples

Examples use placeholder project codes such as **PROJ1** and **PROJ2**. Replace them with your real Qase project codes in config and test code.

## Configuration

All examples use a `qase.config.json` (or framework config) with the following structure:

```json
{
  "mode": "testops_multi",
  "testops": {
    "api": {
      "token": "<your-api-token>",
      "host": "qase.io"
    },
    "batch": { "size": 100 }
  },
  "testops_multi": {
    "default_project": "PROJ1",
    "projects": [
      {
        "code": "PROJ1",
        "run": {
          "title": "PROJ1 Multi-Project Run",
          "description": "Test run for PROJ1 project",
          "complete": true
        },
        "environment": "staging"
      },
      {
        "code": "PROJ2",
        "run": {
          "title": "PROJ2 Multi-Project Run",
          "description": "Test run for PROJ2 project",
          "complete": true
        },
        "environment": "production"
      }
    ]
  }
}
```

## Running Examples

### Vitest

1. Install dependencies and link reporters (from repo root or example folder).
2. Set a valid Qase API token in config or `QASE_TESTOPS_API_TOKEN`.
3. Run:

   ```bash
   cd examples/multiProject/vitest
   npm test
   ```

   Or: `QASE_MODE=testops_multi npm test`

### Jest

1. Install dependencies; set API token in config.
2. Run:

   ```bash
   cd examples/multiProject/jest
   npm test
   ```

### Mocha

1. Install dependencies; set API token in config.
2. Run:

   ```bash
   cd examples/multiProject/mocha
   npm test
   ```

### Playwright

1. Install dependencies; set API token in config.
2. Run:

   ```bash
   cd examples/multiProject/playwright
   npx playwright test
   ```

### Cypress

1. Install dependencies; set API token in reporter options in `cypress.config.js`.
2. Run:

   ```bash
   cd examples/multiProject/cypress
   npx cypress run
   ```

### WDIO

1. Install dependencies; set API token in `qase.config.json`.
2. Run:

   ```bash
   cd examples/multiProject/wdio
   npx wdio run ./wdio.conf.js
   ```

### CucumberJS

1. Install dependencies; set API token in `qase.config.json`.
2. Run:

   ```bash
   cd examples/multiProject/cucumberjs
   npx cucumber-js -f cucumberjs-qase-reporter features -r step_definitions --publish-quiet
   ```

### Newman

1. Set API token in `qase.config.json`.
2. Run:

   ```bash
   cd examples/multiProject/newman
   npx newman run sample-collection.json
   ```

### TestCafe

1. Set API token in `qase.config.json`.
2. Run:

   ```bash
   cd examples/multiProject/testcafe
   npx testcafe chrome multiProjectTests.js
   ```

## Test Examples

### Single project with single ID

**Vitest:** `it(addQaseId('Test name', [1]), () => { ... })`  
**Jest / Mocha / WDIO:** `test(qase(1, 'Test name'), () => { ... })` or `it(qase(1, 'Test name'), () => { ... })`  
**Cypress:** `qase.projects({ PROJ1: [1] }, it('Test name', () => { ... }))`  
**Playwright:** `qase.projects({ PROJ1: [1] });` inside the test  
**CucumberJS:** `@qaseid.PROJ1(1)` in feature  
**Newman:** `// qase PROJ1: 1` in test script  
**TestCafe:** `test.meta('qase', qase.projects({ PROJ1: [1] }).create())`

### Single project with multiple IDs

**Vitest:** `it(addQaseProjects('Test name', { PROJ1: [2, 3] }), () => { ... })`  
**Jest / Mocha / WDIO:** `test(qase.projects({ PROJ1: [2, 3] }, 'Test name'), () => { ... })`  
**Cypress:** `qase.projects({ PROJ1: [2, 3] }, it('Test name', () => { ... }))`  
**CucumberJS:** `@qaseid.PROJ1(2,3)` in feature

### Multiple projects

**Vitest:** `it(addQaseProjects('Test name', { PROJ1: [4], PROJ2: [10] }), () => { ... })`  
**Jest / Mocha / WDIO:** `test(qase.projects({ PROJ1: [4], PROJ2: [10] }, 'Test name'), () => { ... })`  
**Cypress:** `qase.projects({ PROJ1: [4], PROJ2: [10] }, it('Test name', () => { ... }))`  
**Playwright:** `qase.projects({ PROJ1: [4], PROJ2: [10] });` inside the test  
**CucumberJS:** `@qaseid.PROJ1(4)` and `@qaseid.PROJ2(10)` in feature  
**Newman:** `// qase PROJ1: 4` and `// qase PROJ2: 10` in script  
**TestCafe:** `test.meta('qase', qase.projects({ PROJ1: [4], PROJ2: [10] }).create())`

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

## What to Expect

When you run the examples:

1. **Test runs are created** in each configured project (e.g. PROJ1 and PROJ2).
2. **Test results are sent** to the appropriate projects based on the mapping you specify.
3. **Each project has its own test run** with the title and description from config.
4. **Results appear** in both projects' dashboards.
5. **Tests without any Qase ID** are sent to the `default_project` without linking to a test case.

## Expected Behavior by Framework

### CucumberJS
* Uses Gherkin tag syntax: `@qaseid.PROJ1(1)` and `@qaseid.PROJ2(2)` in feature files
* Each scenario can be reported to multiple projects using separate tags
* Native Gherkin Given/When/Then steps are automatically captured
* Attachments via `this.attach()` in step definitions

### Newman
* Uses comment-based markers: `// qase PROJ1: 1` and `// qase PROJ2: 2` in test scripts
* Multiple comments before `pm.test()` map the same test to multiple projects
* No programmatic steps or attachments API (Postman limitation)
* Collection structure determines test organization

### TestCafe
* Uses builder pattern: `test.meta(qase.projects({ PROJ1: [1], PROJ2: [2] }).create())`
* Chaining supported: `qase.projects({...}).title('...').fields({...}).create()`
* Nested steps use callback parameter (s, s1, s2) for hierarchy
* Attachments use `type` parameter (not `contentType`)

### WDIO
* **Mocha/Jasmine mode:** `it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'Test name'), () => {...})`
* **Cucumber mode:** Uses Gherkin tags like CucumberJS
* Supports both programmatic steps and Gherkin steps depending on framework
* Reporter options: `disableWebdriverStepsReporting`, `useCucumber`

## Mapping Tests to Projects (Summary)

| Reporter   | Helper / usage |
|-----------|-----------------|
| **Vitest** | `addQaseProjects('Test name', { PROJ1: [1], PROJ2: [2] })` in test name |
| **Jest**   | `qase.projects({ PROJ1: [1], PROJ2: [2] }, 'Test name')` as test title |
| **Mocha**  | `qase.projects({ PROJ1: [1], PROJ2: [2] }, 'Test name')` as test title |
| **WDIO**   | `qase.projects({ PROJ1: [1], PROJ2: [2] }, 'Test name')` as test title |
| **Cypress**| `qase.projects({ PROJ1: [1], PROJ2: [2] }, it('Test name', () => { ... }))` |
| **Playwright** | `qase.projects(mapping)` in test; `qase.projectsTitle(name, mapping)` as test name; annotation `QaseProjects` with JSON |
| **Cypress + Cucumber** | Tags `@qaseid.PROJ1(1)` `@qaseid.PROJ2(2)` in feature files |
| **CucumberJS** | Tags `@qaseid.PROJ1(1)` `@qaseid.PROJ2(2)` in feature files |
| **Newman** | `// qase PROJ1: 1,2` in test script |
| **TestCafe** | `qase.projects({ PROJ1: [1], PROJ2: [2] }).create()` in `test.meta()` |

## Framework-Specific Documentation

For detailed multi-project documentation per framework, see:

* [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support) — configuration and overview
* [Cypress Multi-Project Guide](../../qase-cypress/docs/MULTI_PROJECT.md)
* [Playwright Multi-Project Guide](../../qase-playwright/docs/MULTI_PROJECT.md)
* [Jest Multi-Project Guide](../../qase-jest/docs/MULTI_PROJECT.md)
* [Vitest Multi-Project Guide](../../qase-vitest/docs/MULTI_PROJECT.md)
* [Mocha Multi-Project Guide](../../qase-mocha/docs/MULTI_PROJECT.md)
* [WDIO Multi-Project Guide](../../qase-wdio/docs/MULTI_PROJECT.md)
* [CucumberJS Multi-Project Guide](../../qase-cucumberjs/docs/MULTI_PROJECT.md)
* [Newman](newman/README.md) and [TestCafe](testcafe/README.md) — see per-folder README

## Notes

* Ensure the projects (e.g. PROJ1, PROJ2) exist in your Qase instance and replace placeholder codes in config and tests.
* Set a valid API token in config or environment before running.
* Test case IDs in examples (1, 2, 10, etc.) should exist in your projects or be created there.
* The `default_project` setting is used when a test does not specify any project mapping; results without any case ID are also sent to the default project.
