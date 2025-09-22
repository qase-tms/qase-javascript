# ResultStepExecution


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | [**ResultStepStatus**](ResultStepStatus.md) |  | [default to undefined]
**start_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**end_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**duration** | **number** | Duration of the test step execution in milliseconds. | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { ResultStepExecution } from 'qase-api-v2-client';

const instance: ResultStepExecution = {
    status,
    start_time,
    end_time,
    duration,
    comment,
    attachments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
