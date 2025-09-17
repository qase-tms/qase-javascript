# TestStepResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 1 - passed, 2 - failed, 3 - blocked, 5 - skipped, 7 - in_progress | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps results will be here. The same structure is used for them for them. | [optional] [default to undefined]

## Example

```typescript
import { TestStepResult } from 'qase-api-client';

const instance: TestStepResult = {
    status,
    position,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
