# ResultExecution


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Can have the following values passed, failed, blocked, skipped, invalid + custom statuses | [default to undefined]
**start_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**end_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**duration** | **number** | Duration of the test execution in milliseconds. | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**thread** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ResultExecution } from 'qase-api-v2-client';

const instance: ResultExecution = {
    status,
    start_time,
    end_time,
    duration,
    stacktrace,
    thread,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
