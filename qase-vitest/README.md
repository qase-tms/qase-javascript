# Qase TestOps Vitest reporter

Qase Vitest reporter sends test results and metadata to Qase.io.
It can work in different test automation scenarios:

* Create new test cases in Qase from existing autotests.
* Report Vitest test results to existing test cases in Qase.

Testing frameworks that use Vitest as a test runner can also be used with Vitest reporter.

To install the latest version, run:

```shell
npm install vitest-qase-reporter
```

# Contents

- [Qase TestOps Vitest reporter](#qase-testops-vitest-reporter)
- [Contents](#contents)
  - [Getting started](#getting-started)
  - [Using Reporter](#using-reporter)
    - [Metadata](#metadata)
    - [Advanced Usage with Annotations](#advanced-usage-with-annotations)
  - [Configuration](#configuration)
  - [Documentation](#documentation)
  - [Requirements](#requirements)

## Getting started

To report your tests results to Qase, install `qase-vitest`,
and add a reporter config in the `vitest.config.ts` file.
A minimal configuration needs just two things:

* Qase project code, for example, in https://app.qase.io/project/DEMO the code is `DEMO`.
* Qase API token, created on the [Apps page](https://app.qase.io/apps?app=vitest-reporter).

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
        {
          mode: 'testops',
          testops: {
            api: {
              token: 'api_token'
            },
            project: 'project_code',
          },
        },
      ],
    ],
  },
});
```

Now, run the Vitest tests as usual.
Test results will be reported to a new test run in Qase.

```console
$ npx vitest run
Determining test suites to run...
...
qase: Project DEMO exists
qase: Using run 42 to publish test results
...

Ran all test suites.
```

## Using Reporter

The Vitest reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

### Metadata

- `qase.title` - set the title of the test case
- `qase.fields` - set the fields of the test case
- `qase.suite` - set the suite of the test case
- `qase.comment` - set the comment of the test case
- `qase.parameters` - set the parameters of the test case
- `qase.groupParameters` - set the group parameters of the test case
- `qase.ignore` - ignore the test case in Qase. The test will be executed, but the results will not be sent to Qase.
- `qase.step` - create a step in the test case
- `qase.attach` - attach a file to the test case

```typescript
import { describe, it, test, expect } from 'vitest';
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';

describe('My First Test', () => {
  test(addQaseId('Several ids', [1, 2]), () => {
    expect(true).toBe(true);
  });

  test(addQaseId('Correct test', [3]), () => {
    expect(true).toBe(true);
  });

  test.skip(addQaseId('Skipped test', [4]), () => {
    expect(true).toBe(true);
  });

  test(addQaseId('Failed test', ['5', '6']), () => {
    expect(true).toBe(false);
  });
});
```

### Advanced Usage with Annotations

```typescript
import { describe, it, expect } from 'vitest';
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';

describe('Qase Annotations Example', () => {
  it(addQaseId(20, 'Basic test with qase ID'), () => {
    expect(1 + 1).toBe(2);
  });

  it('Test with qase annotations', withQase(async ({ qase, annotate }) => {
    // Set test title
    await qase.title('Advanced Test with Annotations');
    
    // Add comment
    await qase.comment('This test demonstrates qase annotations functionality');
    
    // Set suite
    await qase.suite('Vitest Integration Suite');
    
    // Set fields
    await qase.fields({
      description: 'Test description for Qase',
      severity: 'critical',
      priority: 'high',
      layer: 'e2e'
    });
    
    // Set parameters
    await qase.parameters({
      environment: 'staging',
      browser: 'chrome',
      version: '1.0.0'
    });
    
    // Add steps
    await qase.step('Initialize test data', async () => {
      expect(true).toBe(true);
    });
    
    await qase.step('Execute main test logic', async () => {
      expect(2 + 2).toBe(4);
    });
    
    // Add attachment with content
    await qase.attach({
      name: 'test-data.json',
      content: JSON.stringify({ test: 'data' }),
      type: 'application/json'
    });
    
    // Use regular annotate for custom annotations
    await annotate('Custom annotation message', 'info');
    
    // Final assertion
    expect(Math.max(1, 2, 3)).toBe(3);
  }));
});
```

To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_MODE=testops npx vitest run
```

or

```bash
npm test
```

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Reporter options (* - required):

- `mode` - `testops`/`off` Enables reporter, default - `off`
- `debug` - Enables debug logging, default - `false`
- `environment` - To execute with the sending of the environment information
- `captureLogs` - Capture console logs, default - `false`
- `uploadAttachments` - Upload attachments to Qase, default - `false`
- *`testops.api.token` - Token for API access, you can generate it [here](https://developers.qase.io/#authentication).
- *`testops.project` - [Your project's code](https://help.qase.io/en/articles/9787250-how-do-i-find-my-project-code)
- `testops.api.baseUrl` - Qase API base URL (optional)
- `testops.run.id` - Qase test run ID, used when the test run was created earlier using CLI or API call.
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed

Example `vitest.config.ts` config:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
        {
          mode: 'testops',
          testops: {
            api: {
              token: 'api_key'
            },
            project: 'project_code',
            run: {
              complete: true,
            },
            uploadAttachments: true,
          },
          debug: true,
          captureLogs: true,
        },
      ],
    ],
  },
});
```

You can check example configuration with multiple reporters in [example project](../examples/vitest/vitest.config.ts).

Supported ENV variables:

- `QASE_MODE` - Same as `mode`
- `QASE_DEBUG` - Same as `debug`
- `QASE_ENVIRONMENT` - Same as `environment`
- `QASE_TESTOPS_API_TOKEN` - Same as `testops.api.token`
- `QASE_TESTOPS_PROJECT` - Same as `testops.project`
- `QASE_TESTOPS_RUN_ID` - Pass Run ID from ENV and override reporter option `testops.run.id`
- `QASE_TESTOPS_RUN_TITLE` - Same as `testops.run.title`
- `QASE_TESTOPS_RUN_DESCRIPTION` - Same as `testops.run.description`

## Documentation

For detailed documentation and advanced usage, see [USAGE.md](./docs/usage.md).

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following
the [link](https://nodejs.org/en/about/releases/)

`vitest >= 3.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
