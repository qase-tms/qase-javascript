# SharedStepContentCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | **string** |  | [default to undefined]
**hash** | **string** |  | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps will be here. The same structure is used for them. | [optional] [default to undefined]

## Example

```typescript
import { SharedStepContentCreate } from 'qase-api-client';

const instance: SharedStepContentCreate = {
    action,
    hash,
    expected_result,
    data,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
