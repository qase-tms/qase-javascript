# ReviewBulk


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**reviews** | [**Array&lt;ReviewCreate&gt;**](ReviewCreate.md) | Validated as a whole: if any item is invalid nothing is created. Otherwise each item is processed on its own and reported in the response. | [default to undefined]

## Example

```typescript
import { ReviewBulk } from 'qase-api-client';

const instance: ReviewBulk = {
    reviews,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
