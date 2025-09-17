# ResultQuery


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**result_hash** | **string** |  | [default to undefined]
**hash** | **string** |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**run_id** | **number** |  | [optional] [default to undefined]
**case_id** | **number** |  | [optional] [default to undefined]
**steps** | [**Array&lt;TestStepResult&gt;**](TestStepResult.md) |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**is_api_result** | **boolean** |  | [optional] [default to undefined]
**time_spent_ms** | **number** |  | [optional] [default to undefined]
**end_time** | **string** |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ResultQuery } from 'qase-api-client';

const instance: ResultQuery = {
    result_hash,
    hash,
    comment,
    stacktrace,
    run_id,
    case_id,
    steps,
    status,
    is_api_result,
    time_spent_ms,
    end_time,
    attachments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
