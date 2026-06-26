# TestStepResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 1 - passed, 2 - failed, 3 - blocked, 5 - skipped, 7 - in_progress | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**comment** | **string** | Comment left for the step. | [optional] [default to undefined]
**start_time** | **number** | Unix timestamp of the step start time. | [optional] [default to undefined]
**end_time** | **number** | Unix timestamp of the step end time. | [optional] [default to undefined]
**duration_ms** | **number** | Step duration in milliseconds. | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**steps** | [**Array&lt;TestStepResult&gt;**](TestStepResult.md) | Nested steps results will be here. The same structure is used for them. | [optional] [default to undefined]

## Example

```typescript
import { TestStepResult } from 'qase-api-client';

const instance: TestStepResult = {
    status,
    position,
    comment,
    start_time,
    end_time,
    duration_ms,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
