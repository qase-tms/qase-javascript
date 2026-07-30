# ResultExecution


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Can have the following values passed, failed, blocked, skipped, invalid + custom statuses | [default to undefined]
**start_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**end_time** | **number** | Unix epoch time in seconds (whole part) and milliseconds (fractional part). | [optional] [default to undefined]
**duration** | **number** | Duration of the test execution in milliseconds. | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**error_context** | **string** | Free-form failure context captured by the reporter. For Playwright this is the content of error-context.md (test info, error details, page snapshot), so it may include rendered page content. Stored verbatim so it can be copied as raw text. Values longer than 262144 characters are silently truncated by Qase and the request still succeeds. Write-only — not returned by the result read endpoints. | [optional] [default to undefined]
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
    error_context,
    thread,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
