# PlanDetailed


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**cases_count** | **number** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**created** | **string** | Deprecated, use the &#x60;created_at&#x60; property instead. | [optional] [default to undefined]
**updated** | **string** | Deprecated, use the &#x60;updated_at&#x60; property instead. | [optional] [default to undefined]
**average_time** | **number** |  | [optional] [default to undefined]
**cases** | [**Array&lt;PlanDetailedAllOfCases&gt;**](PlanDetailedAllOfCases.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PlanDetailed } from 'qase-api-client';

const instance: PlanDetailed = {
    id,
    title,
    description,
    cases_count,
    created_at,
    updated_at,
    created,
    updated,
    average_time,
    cases,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
