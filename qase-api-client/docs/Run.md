# Run


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**run_id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**status_text** | **string** |  | [optional] [default to undefined]
**start_time** | **string** |  | [optional] [default to undefined]
**end_time** | **string** |  | [optional] [default to undefined]
**_public** | **boolean** |  | [optional] [default to undefined]
**stats** | [**RunStats**](RunStats.md) |  | [optional] [default to undefined]
**time_spent** | **number** | Time in ms. | [optional] [default to undefined]
**elapsed_time** | **number** | Time in ms. | [optional] [default to undefined]
**environment** | [**RunEnvironment**](RunEnvironment.md) |  | [optional] [default to undefined]
**milestone** | [**RunMilestone**](RunMilestone.md) |  | [optional] [default to undefined]
**custom_fields** | [**Array&lt;CustomFieldValue&gt;**](CustomFieldValue.md) |  | [optional] [default to undefined]
**tags** | [**Array&lt;TagValue&gt;**](TagValue.md) |  | [optional] [default to undefined]
**cases** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**plan_id** | **number** |  | [optional] [default to undefined]
**configurations** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**external_issue** | [**RunExternalIssue**](RunExternalIssue.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Run } from 'qase-api-client';

const instance: Run = {
    id,
    run_id,
    title,
    description,
    status,
    status_text,
    start_time,
    end_time,
    _public,
    stats,
    time_spent,
    elapsed_time,
    environment,
    milestone,
    custom_fields,
    tags,
    cases,
    plan_id,
    configurations,
    external_issue,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
