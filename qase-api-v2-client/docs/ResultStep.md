# ResultStep


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**ResultStepData**](ResultStepData.md) |  | [optional] [default to undefined]
**execution** | [**ResultStepExecution**](ResultStepExecution.md) |  | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps will be here. The same structure is used for them. | [optional] [default to undefined]

## Example

```typescript
import { ResultStep } from 'qase-api-v2-client';

const instance: ResultStep = {
    data,
    execution,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
