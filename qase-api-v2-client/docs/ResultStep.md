# ResultStep

## Description

Model for test step result. Supports nested steps.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| position | number | Step position | Yes |
| status | [ResultStepStatus](ResultStepStatus.md) | Step status | Yes |
| comment | string | Step comment | No |
| attachments | string[] | List of attachment hashes | No |
| execution | [ResultStepExecution](ResultStepExecution.md) | Step execution details | No |
| data | [ResultStepData](ResultStepData.md) | Step data | No |
| steps | object[] | Nested steps. The same structure is used for them | No |

## Example

```typescript
const resultStep: ResultStep = {
    execution: {
        duration: 1000,
        status: 'passed'
    },
    data: {
        action: 'Click on the login button',
        expected_result: 'User is logged in',
        actual_result: 'User was successfully logged in'
    },
    steps: [
        {
            data: {
                action: 'Enter username',
                expected_result: 'Username is entered'
            },
            execution: {
                status: 'passed',
                duration: 500
            }
        },
        {
            data: {
                action: 'Enter password',
                expected_result: 'Password is entered'
            },
            execution: {
                status: 'passed',
                duration: 500
            }
        }
    ]
};
```

## Related Models

- [ResultStepStatus](ResultStepStatus.md)
- [ResultStepExecution](ResultStepExecution.md)
- [ResultStepData](ResultStepData.md)
