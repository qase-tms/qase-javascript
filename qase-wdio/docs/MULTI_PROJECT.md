# Multi-Project Support in WebdriverIO (WDIO)

Qase WDIO Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your WDIO config (e.g. in `wdio.conf.js` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

## Using `qase.projects(mapping, name)`

Use `qase.projects(mapping, name)` to set the test title with multi-project markers. Use the returned string as the test name:

```javascript
const { qase } = require('wdio-qase-reporter');

// Single project
it(qase(1, 'should work'), async () => { ... });

// Multi-project
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), async () => { ... });

// Multiple IDs per project
it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'Checkout'), async () => { ... });
```

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

## Tests Without Project Mapping

Tests that do not use `qase.projects()` and have no `(Qase PROJ: ids)` in the title are sent to the `default_project`. If they use `qase(id, name)` (single-project), that ID is used for the default project.

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code`.
2. **Mode**: Set `mode` to `testops_multi` in WDIO reporter config.
3. **Title format**: The helper produces a title like `Name (Qase PROJ1: 1,2) (Qase PROJ2: 3)` so the reporter can parse the mapping.

## Examples

See the [multi-project WDIO example](../../examples/multiProject/wdio/) for a complete runnable setup.

## Troubleshooting

* Verify `mode` is `testops_multi` and project codes in `qase.projects()` match the config.
* Ensure the test name is the string returned by `qase.projects(mapping, name)` (or an equivalent title with markers).
