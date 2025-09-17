# ResultUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** |  | [optional] [default to undefined]
**time_ms** | **number** |  | [optional] [default to undefined]
**defect** | **boolean** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**steps** | [**Array&lt;TestStepResultCreate&gt;**](TestStepResultCreate.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ResultUpdate } from 'qase-api-client';

const instance: ResultUpdate = {
    status,
    time_ms,
    defect,
    attachments,
    stacktrace,
    comment,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
