# ReviewUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**reviewers** | **Array&lt;string&gt;** | Author UUIDs of team members assigned as reviewers (see &#x60;GET /author&#x60;). When provided, replaces the current reviewer list; an empty array removes all reviewers. Omit to leave reviewers unchanged. | [optional] [default to undefined]
**proposed_case** | [**ReviewCaseData**](ReviewCaseData.md) | Sent fields are merged into the stored proposal. Changing the proposal resets all existing approvals; updating only the reviewers keeps them. | [optional] [default to undefined]

## Example

```typescript
import { ReviewUpdate } from 'qase-api-client';

const instance: ReviewUpdate = {
    reviewers,
    proposed_case,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
