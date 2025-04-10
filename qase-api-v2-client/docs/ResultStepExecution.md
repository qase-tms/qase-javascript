# ResultStepExecution

## Description

Model for test step execution details.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| status | [ResultStepStatus](ResultStepStatus.md) | Step execution status | Yes |
| start_time | number | Unix epoch time in seconds (whole part) and milliseconds (fractional part) | No |
| end_time | number | Unix epoch time in seconds (whole part) and milliseconds (fractional part) | No |
| duration | number | Duration of the test step execution in milliseconds | No |
| comment | string | Step execution comment | No |
| attachments | string[] | List of attachment hashes | No |

## Example

```typescript
const stepExecution: ResultStepExecution = {
    status: 'passed',
    start_time: 1678901234.567,
    end_time: 1678901235.678,
    duration: 1111,
    comment: 'Step executed successfully',
    attachments: ['abc123']
};
```

## Related Models

- [ResultStepStatus](ResultStepStatus.md)
