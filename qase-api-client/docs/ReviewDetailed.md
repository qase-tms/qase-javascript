# ReviewDetailed


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Review ID, unique within the project. | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**type** | **string** | &#x60;create&#x60; — the review proposes a new test case; &#x60;edit&#x60; — the review proposes changes to an existing test case. | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**case_id** | **number** | ID of the reviewed test case. Null for new-case draft reviews. | [optional] [default to undefined]
**author_uuid** | **string** | Author UUID of the review creator (see &#x60;GET /author&#x60;). | [optional] [default to undefined]
**reviewers** | [**Array&lt;ReviewReviewersInner&gt;**](ReviewReviewersInner.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**proposed_case** | **object** | The proposed test case state. Merging the review applies it to the test case. | [optional] [default to undefined]

## Example

```typescript
import { ReviewDetailed } from 'qase-api-client';

const instance: ReviewDetailed = {
    id,
    title,
    type,
    status,
    case_id,
    author_uuid,
    reviewers,
    created_at,
    updated_at,
    proposed_case,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
