# TestStepCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | **string** |  | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps may be passed here. Use same structure for them. | [optional] [default to undefined]

## Example

```typescript
import { TestStepCreate } from 'qase-api-client';

const instance: TestStepCreate = {
    action,
    expected_result,
    data,
    position,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
