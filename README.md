# [Qase TMS](https://qase.io) Cypress Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

## Installation

```
npm install cypress-qase-reporter
```

## Configuration

cypress.json configuration:

```json
{
    "reporter": "cypress-qase-reporter",
    "reporterOptions": {
        "apiToken": "578e3b73a34f06e84eafea103cd44dc24253b2c5",
        "projectCode": "PRJCODE",
        "runId": 45,
        "logging": true  # Show debug logs for run
    }
}
```

ENV variables:
```bash
QASE_REPORT=1 - enable qase reporter
QASE_RUN_ID=45 - override runId from ENV
```

## Using Reporter

If you want to decorate come test with Qase Case ID you could use qase function:

```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('My First Test', () => {
    qase(3,
        it('Correct test', () => {
            expect(true).to.equal(true);
        })
    );
    qase(4,
        it.skip('Skipped test', () => {
            expect(true).to.equal(true);
        })
    );
    );
    qase(5,
        it('Failed test', () => {
            expect(true).to.equal(false);
        })
    );
});

```

## Running Qase Reporter

To start cypress run with qase reporter run it like this:
```bash
QASE_REPORT=1 npx cypress run
```

![Reporter in console](docs/stdout.png)
