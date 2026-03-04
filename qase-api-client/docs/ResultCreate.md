# ResultCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Can have the following values &#x60;passed&#x60;, &#x60;failed&#x60;, &#x60;blocked&#x60;, &#x60;skipped&#x60;, &#x60;invalid&#x60; + custom statuses | [default to undefined]
**case_id** | **number** |  | [optional] [default to undefined]
**_case** | [**ResultCreateCase**](ResultCreateCase.md) |  | [optional] [default to undefined]
**start_time** | **number** |  | [optional] [default to undefined]
**time** | **number** |  | [optional] [default to undefined]
**time_ms** | **number** |  | [optional] [default to undefined]
**defect** | **boolean** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**param** | **{ [key: string]: string; }** | A map of parameters (name &#x3D;&gt; value) | [optional] [default to undefined]
**param_groups** | **Array&lt;Array&lt;string&gt;&gt;** | List parameter groups by name only. Add their values in the \&#39;param\&#39; field | [optional] [default to undefined]
**steps** | [**Array&lt;TestStepResultCreate&gt;**](TestStepResultCreate.md) |  | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { ResultCreate } from 'qase-api-client';

const instance: ResultCreate = {
    status,
    case_id,
    _case,
    start_time,
    time,
    time_ms,
    defect,
    attachments,
    stacktrace,
    comment,
    param,
    param_groups,
    steps,
    author_id,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
