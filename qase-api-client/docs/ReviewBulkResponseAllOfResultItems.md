# ReviewBulkResponseAllOfResultItems


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**review_id** | **number** | ID of the created review. Null when the item failed. | [optional] [default to undefined]
**case_id** | **number** | The &#x60;case_id&#x60; submitted with the item, echoed back for correlation. Null for new-case draft reviews. | [optional] [default to undefined]
**error** | **string** | Failure reason. Null when the item was created. | [optional] [default to undefined]

## Example

```typescript
import { ReviewBulkResponseAllOfResultItems } from 'qase-api-client';

const instance: ReviewBulkResponseAllOfResultItems = {
    review_id,
    case_id,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
