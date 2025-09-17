# TestStepResultCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** |  | [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**action** | **string** |  | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps results may be passed here. Use same structure for them. | [optional] [default to undefined]

## Example

```typescript
import { TestStepResultCreate } from 'qase-api-client';

const instance: TestStepResultCreate = {
    status,
    position,
    comment,
    attachments,
    action,
    expected_result,
    data,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
