# ResultListResponseAllOfResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** | A number of results in the project, counted up to the pagination bound. | [optional] [default to undefined]
**filtered** | **number** | A number of results that match the filters, counted up to the pagination bound. | [optional] [default to undefined]
**count** | **number** | A number of results in the current page. | [optional] [default to undefined]
**entities** | [**Array&lt;Result&gt;**](Result.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ResultListResponseAllOfResult } from 'qase-api-client';

const instance: ResultListResponseAllOfResult = {
    total,
    filtered,
    count,
    entities,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
