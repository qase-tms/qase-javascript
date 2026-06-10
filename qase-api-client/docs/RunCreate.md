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
**custom_field** | **{ [key: string]: string; }** | Custom field values keyed by the field\&#39;s project-scoped &#x60;internal_id&#x60; (see &#x60;GET /custom_field&#x60;). Values are always **scalar strings**; arrays, objects or non-scalars are rejected.  | Field type           | Value format                              | Example                 | |----------------------|-------------------------------------------|-------------------------| | &#x60;string&#x60;, &#x60;text&#x60;     | Plain string                              | &#x60;\&quot;hello\&quot;&#x60;               | | &#x60;number&#x60;             | Numeric string                            | &#x60;\&quot;42\&quot;&#x60;                  | | &#x60;url&#x60;                | Valid URL                                 | &#x60;\&quot;https://qase.io\&quot;&#x60;     | | &#x60;datetime&#x60;           | Absolute date (ISO 8601 recommended)      | &#x60;\&quot;2026-04-29T15:00:00Z\&quot;&#x60;| | &#x60;selectbox&#x60;, &#x60;radio&#x60; | Option &#x60;id&#x60; as string                     | &#x60;\&quot;1\&quot;&#x60;                   | | &#x60;multiselect&#x60;        | Comma-separated option &#x60;id&#x60;s (no spaces)  | &#x60;\&quot;1,2,3\&quot;&#x60;               | | &#x60;checkbox&#x60;           | &#x60;\&quot;1\&quot;&#x60; to check, &#x60;\&quot;\&quot;&#x60; to uncheck           | &#x60;\&quot;1\&quot;&#x60;                   | | &#x60;user&#x60;               | Team member &#x60;internal_id&#x60; as string       | &#x60;\&quot;42\&quot;&#x60;                  |  Validation: all required fields without a default value must be present and non-empty; unknown &#x60;internal_id&#x60;s are rejected; option-based values must reference an existing option.  Note: a &#x60;required&#x60; checkbox without a default cannot be unchecked via the API — set a default or clear &#x60;required&#x60; in workspace settings.  | [optional] [default to undefined]
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
