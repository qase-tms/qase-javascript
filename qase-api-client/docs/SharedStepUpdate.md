# SharedStepUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**action** | **string** | Deprecated, use the &#x60;steps&#x60; property instead. | [optional] [default to undefined]
**expected_result** | **string** | Deprecated, use the &#x60;steps&#x60; property instead. | [optional] [default to undefined]
**data** | **string** | Deprecated, use the &#x60;steps&#x60; property instead. | [optional] [default to undefined]
**steps** | [**Array&lt;SharedStepContentCreate&gt;**](SharedStepContentCreate.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SharedStepUpdate } from 'qase-api-client';

const instance: SharedStepUpdate = {
    title,
    action,
    expected_result,
    data,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
