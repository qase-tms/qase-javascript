# CreateResultsRequestV2

## Description

Model for creating multiple test run results at once.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| results | [ResultCreate](ResultCreate.md)[] | Array of results to create | Yes |

## Example

```typescript
const createResultsRequestV2: CreateResultsRequestV2 = {
    results: [
        {
            title: 'Test Result 1',
            execution: {
                status: 'passed',
                duration: 1000
            },
            testops_id: 1
        },
        {
            title: 'Test Result 2',
            execution: {
                status: 'failed',
                duration: 2000
            },
            testops_id: 2
        }
    ]
};
```

## Related Models

- [ResultCreate](ResultCreate.md)
- [ResultExecution](ResultExecution.md)
