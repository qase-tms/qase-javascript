# ReviewCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**proposed_case** | [**ReviewCaseData**](ReviewCaseData.md) | For &#x60;create&#x60; reviews &#x60;title&#x60; and all required project fields are required. For &#x60;edit&#x60; reviews send only the fields the proposal changes. | [default to undefined]
**case_id** | **number** | ID of the reviewed test case. When present an &#x60;edit&#x60; review is created, otherwise a &#x60;create&#x60; review with a new-case draft. | [optional] [default to undefined]
**reviewers** | **Array&lt;string&gt;** | Author UUIDs of team members to assign as reviewers (see &#x60;GET /author&#x60;). | [optional] [default to undefined]

## Example

```typescript
import { ReviewCreate } from 'qase-api-client';

const instance: ReviewCreate = {
    proposed_case,
    case_id,
    reviewers,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
