# RunCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**include_all_cases** | **boolean** |  | [optional] [default to undefined]
**cases** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**is_autotest** | **boolean** |  | [optional] [default to undefined]
**environment_id** | **number** |  | [optional] [default to undefined]
**environment_slug** | **string** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**plan_id** | **number** |  | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**configurations** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**custom_field** | **{ [key: string]: string; }** | A map of custom fields values (id &#x3D;&gt; value) | [optional] [default to undefined]
**start_time** | **string** |  | [optional] [default to undefined]
**end_time** | **string** |  | [optional] [default to undefined]
**is_cloud** | **boolean** | Indicates if the run is created for the Test Cases produced by AIDEN | [optional] [default to undefined]
**cloud_run_config** | [**RunCreateCloudRunConfig**](RunCreateCloudRunConfig.md) |  | [optional] [default to undefined]

## Example

```typescript
import { RunCreate } from 'qase-api-client';

const instance: RunCreate = {
    title,
    description,
    include_all_cases,
    cases,
    is_autotest,
    environment_id,
    environment_slug,
    milestone_id,
    plan_id,
    author_id,
    tags,
    configurations,
    custom_field,
    start_time,
    end_time,
    is_cloud,
    cloud_run_config,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
