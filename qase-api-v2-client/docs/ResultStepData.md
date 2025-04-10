# ResultStepData

## Description

Model for test step data.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| action | string | Step action | Yes |
| expected_result | string | Expected result | Yes |
| input_data | string | Data result | No |
| attachments | string[] | List of attachment hashes | No |

## Example

```typescript
const stepData: ResultStepData = {
    action: 'Click on the login button',
    expected_result: 'User is logged in',
    input_data: 'User name: admin, Password: admin',
    attachments: ['abc123']
};
```

## Related Models

- [ResultStep](ResultStep.md)
