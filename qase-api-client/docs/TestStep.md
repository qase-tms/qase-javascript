# TestStep


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** |  | [optional] [default to undefined]
**shared_step_hash** | **string** |  | [optional] [default to undefined]
**shared_step_nested_hash** | **string** |  | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**action** | **string** |  | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps will be here. The same structure is used for them. | [optional] [default to undefined]

## Example

```typescript
import { TestStep } from 'qase-api-client';

const instance: TestStep = {
    hash,
    shared_step_hash,
    shared_step_nested_hash,
    position,
    action,
    expected_result,
    data,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
