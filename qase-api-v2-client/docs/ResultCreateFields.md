# ResultCreateFields


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**author** | **string** | Author of the related test case (member id, name or email). If set and test case auto-creation is enabled, the author will be used to create the test case | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**layer** | **string** |  | [optional] [default to undefined]
**severity** | **string** |  | [optional] [default to undefined]
**priority** | **string** |  | [optional] [default to undefined]
**behavior** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**muted** | **string** |  | [optional] [default to undefined]
**is_flaky** | **string** |  | [optional] [default to undefined]
**executed_by** | **string** | User who executed the test (member id, name or email) | [optional] [default to undefined]

## Example

```typescript
import { ResultCreateFields } from 'qase-api-v2-client';

const instance: ResultCreateFields = {
    author,
    description,
    preconditions,
    postconditions,
    layer,
    severity,
    priority,
    behavior,
    type,
    muted,
    is_flaky,
    executed_by,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
