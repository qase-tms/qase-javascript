# ResultStepStatus

## Description

Enumeration of possible test step statuses.

## Values

| Value | Description |
|-------|-------------|
| passed | Step passed successfully |
| failed | Step failed |
| blocked | Step is blocked |
| skipped | Step was skipped |
| in_progress | Step is in progress |

## Example

```typescript
const stepStatus: ResultStepStatus = ResultStepStatus.PASSED;
```

## Related Models

- [ResultStep](ResultStep.md)
