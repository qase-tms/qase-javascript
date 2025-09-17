# SharedStep


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**action** | **string** |  | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**steps** | [**Array&lt;SharedStepContent&gt;**](SharedStepContent.md) |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**cases** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**cases_count** | **number** |  | [optional] [default to undefined]
**created** | **string** | Deprecated, use the &#x60;created_at&#x60; property instead. | [optional] [default to undefined]
**updated** | **string** | Deprecated, use the &#x60;updated_at&#x60; property instead. | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { SharedStep } from 'qase-api-client';

const instance: SharedStep = {
    hash,
    title,
    action,
    expected_result,
    steps,
    data,
    cases,
    cases_count,
    created,
    updated,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
