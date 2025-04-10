# ResultExecution

## Description

Model for test execution details.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| status | string | Execution status. Can have the following values: passed, failed, blocked, skipped, invalid + custom statuses | Yes |
| start_time | number | Unix epoch time in seconds (whole part) and milliseconds (fractional part) | No |
| end_time | number | Unix epoch time in seconds (whole part) and milliseconds (fractional part) | No |
| duration | number | Duration of the test execution in milliseconds | No |
| stacktrace | string | Stack trace if execution failed | No |
| thread | string | Thread information | No |

## Example

```typescript
const resultExecution: ResultExecution = {
    status: 'passed',
    start_time: 1678901234.567,
    end_time: 1678901235.678,
    duration: 1111,
    stacktrace: null,
    thread: 'main'
};
```

## Related Models

- [ResultCreate](ResultCreate.md)
