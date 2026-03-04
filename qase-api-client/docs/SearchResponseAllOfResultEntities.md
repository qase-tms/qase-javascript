# SearchResponseAllOfResultEntities


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**run_id** | **number** |  | [default to undefined]
**plan_id** | **number** |  | [default to undefined]
**result_hash** | **string** |  | [default to undefined]
**requirement_id** | **number** |  | [default to undefined]
**test_case_id** | **number** |  | [default to undefined]
**defect_id** | **number** |  | [default to undefined]
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
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
**hash** | **string** |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**stacktrace** | **string** |  | [optional] [default to undefined]
**case_id** | **number** |  | [optional] [default to undefined]
**steps** | [**Array&lt;TestStep&gt;**](TestStep.md) |  | [optional] [default to undefined]
**is_api_result** | **boolean** |  | [optional] [default to undefined]
**time_spent_ms** | **number** |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**parent_id** | **number** |  | [optional] [default to undefined]
**member_id** | **number** | Deprecated, use &#x60;author_id&#x60; instead. | [optional] [default to undefined]
**type** | **number** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**severity** | **string** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**layer** | **number** |  | [optional] [default to undefined]
**is_flaky** | **number** |  | [optional] [default to undefined]
**behavior** | **number** |  | [optional] [default to undefined]
**automation** | **number** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**suite_id** | **number** |  | [optional] [default to undefined]
**steps_type** | **string** |  | [optional] [default to undefined]
**params** | [**QqlTestCaseParams**](QqlTestCaseParams.md) |  | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]
**updated_by** | **number** | Author ID of the last update. | [optional] [default to undefined]
**actual_result** | **string** |  | [optional] [default to undefined]
**resolved** | **string** |  | [optional] [default to undefined]
**external_data** | **string** |  | [optional] [default to undefined]
**cases_count** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { SearchResponseAllOfResultEntities } from 'qase-api-client';

const instance: SearchResponseAllOfResultEntities = {
    run_id,
    plan_id,
    result_hash,
    requirement_id,
    test_case_id,
    defect_id,
    id,
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
    hash,
    comment,
    stacktrace,
    case_id,
    steps,
    is_api_result,
    time_spent_ms,
    attachments,
    parent_id,
    member_id,
    type,
    created_at,
    updated_at,
    position,
    preconditions,
    postconditions,
    severity,
    priority,
    layer,
    is_flaky,
    behavior,
    automation,
    milestone_id,
    suite_id,
    steps_type,
    params,
    author_id,
    updated_by,
    actual_result,
    resolved,
    external_data,
    cases_count,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
