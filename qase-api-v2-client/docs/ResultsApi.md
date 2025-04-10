# ResultsApi

## Description

API for managing test run results.

## Methods

### createResultV2

Create a single test run result.

#### Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| projectCode | string | Project code | Yes |
| runId | number | Test run ID | Yes |
| resultCreate | [ResultCreate](ResultCreate.md) | Result data | Yes |

#### Returns

Promise<void>

#### Example

```typescript
const result = await qaseApi.results.createResultV2('MP', 1, {
    title: 'Test Result',
    execution: {
        status: 'passed',
        duration: 1000
    },
    testops_id: 1,
    steps: [
        {
            position: 1,
            status: 'passed',
            comment: 'Step completed successfully'
        }
    ]
});
```

### createResultsV2

Create multiple test run results at once.

#### Parameters

| Name | Type | Description | Required |
|------|------|-------------|----------|
| projectCode | string | Project code | Yes |
| runId | number | Test run ID | Yes |
| createResultsRequestV2 | [CreateResultsRequestV2](CreateResultsRequestV2.md) | Results data | Yes |

#### Returns

Promise<void>

#### Example

```typescript
const results = await qaseApi.results.createResultsV2('MP', 1, {
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
});
```

## Related Models

- [ResultCreate](ResultCreate.md)
- [CreateResultsRequestV2](CreateResultsRequestV2.md)
