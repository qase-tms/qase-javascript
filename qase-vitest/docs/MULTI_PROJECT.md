# Multi-Project Support in Vitest

Qase Vitest Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your Vitest config (e.g. in `vitest.config.ts` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

## Using `addQaseProjects(name, mapping)`

Use the `addQaseProjects(name, mapping)` helper from `vitest-qase-reporter/vitest` to build a test name that includes multi-project markers. The reporter parses the title and sets `testops_project_mapping`:

```typescript
import { addQaseId, addQaseProjects } from 'vitest-qase-reporter/vitest';

// Single project (legacy)
it(addQaseId('login flow', [100]), async () => { ... });

// Multi-project
it(addQaseProjects('login flow', { PROJ1: [100], PROJ2: [200] }), async () => { ... });

// Multiple IDs per project
it(addQaseProjects('checkout', { PROJ1: [10, 11], PROJ2: [20] }), async () => { ... });
```

Project codes must match `testops_multi.projects[].code` in your config.

## Tests Without Project Mapping

Tests whose name does not contain multi-project markers (and have no single-project `(Qase ID: …)`) are sent to the `default_project`. Results without any case ID are sent to the default project without linking to a test case.

## Important Notes

1. **Project codes must match**: Keys in `addQaseProjects('name', { PROJ1: [1], ... })` must match `testops_multi.projects[].code`.
2. **Mode**: Use `mode: 'testops_multi'` in Vitest reporter config.
3. **Title format**: The helper produces a title like `Name (Qase PROJ1: 1,2) (Qase PROJ2: 3)`.

## Examples

See the [multi-project Vitest example](../../examples/multiProject/vitest/) for a complete runnable setup.

## Troubleshooting

* Ensure `mode` is `testops_multi` and project codes match the config.
* Use `addQaseProjects(name, mapping)` (or an equivalent title format) so the reporter can parse the mapping from the test name.
