# ResultCreateFields

## Description

Model for additional fields in test result. This model supports dynamic fields through index signature.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| [key: string] | string \| any | Dynamic field with string or any value | No |
| author | string | Author of the related test case (member id, name or email). If set and test case auto-creation is enabled, the author will be used to create the test case | No |
| description | string | Test case description | No |
| preconditions | string | Test case preconditions | No |
| postconditions | string | Test case postconditions | No |
| layer | string | Test case layer | No |
| severity | string | Test case severity | No |
| priority | string | Test case priority | No |
| behavior | string | Test case behavior | No |
| type | string | Test case type | No |
| muted | string | Whether the test case is muted | No |
| is_flaky | string | Whether the test case is flaky | No |
| executed_by | string | User who executed the test (member id, name or email) | No |

## Example

```typescript
const fields: ResultCreateFields = {
    author: 'john.doe@example.com',
    description: 'Test case for user login functionality',
    preconditions: 'User account exists',
    postconditions: 'User is logged in',
    layer: 'UI',
    severity: 'high',
    priority: 'medium',
    behavior: 'positive',
    type: 'functional',
    muted: 'false',
    is_flaky: 'false',
    executed_by: 'jane.doe@example.com',
    // Dynamic fields
    'custom_field_1': 'value1',
    'custom_field_2': 'value2'
};
```

## Related Models

- [ResultCreate](ResultCreate.md)
