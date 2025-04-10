# ResultRelations

## Description

Model for test result relations.

## Properties

| Name | Type | Description | Required |
|------|------|-------------|----------|
| suite | [RelationSuite](RelationSuite.md) | Related test suite | No |

## Example

```typescript
const relations: ResultRelations = {
    suite: {
        data: []
    }
};
```

## Related Models

- [RelationSuite](RelationSuite.md)
