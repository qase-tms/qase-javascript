# ResultCreate

## Description

Model for creating a test run result.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| title | string | Result title | Yes |
| execution | [ResultExecution](ResultExecution.md) | Execution details | Yes |
| id | string | Idempotency key | No |
| signature | string | Result signature | No |
| testops_id | number | ID of the test case (cannot be used with testops_ids) | No |
| testops_ids | number[] | IDs of the test cases (cannot be used with testops_id) | No |
| fields | [ResultCreateFields](ResultCreateFields.md) | Additional fields | No |
| attachments | string[] | List of attachment hashes | No |
| steps | [ResultStep](ResultStep.md)[] | Test steps | No |
| steps_type | [ResultStepsType](ResultStepsType.md) | Type of steps | No |
| params | { [key: string]: string } | Parameters | No |
| param_groups | string[][] | Parameter groups | No |
| relations | [ResultRelations](ResultRelations.md) | Related entities | No |
| message | string | Result message | No |
| defect | boolean | Whether to create a defect if the result is failed | No |

## Example

```typescript
const resultCreate: ResultCreate = {
    title: 'Login Test Result',
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
    ],
    attachments: ['abc123'],
    defect: true
};
```

## Related Models

- [ResultExecution](ResultExecution.md)
- [ResultCreateFields](ResultCreateFields.md)
- [ResultStep](ResultStep.md)
- [ResultStepsType](ResultStepsType.md)
- [ResultRelations](ResultRelations.md)
