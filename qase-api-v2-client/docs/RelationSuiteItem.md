# RelationSuiteItem

## Description

Model for test case relation.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| public_id | number | Suite ID | No |
| title | string | Suite title | Yes |

## Example

```typescript
const suiteItem: RelationSuiteItem = {
    public_id: 1,
    title: 'Login with valid credentials'
};
```

## Related Models

- [ResultRelations](ResultRelations.md)
