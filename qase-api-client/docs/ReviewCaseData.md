# ReviewCaseData

The test case fields proposed by the review.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**severity** | **number** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**behavior** | **number** |  | [optional] [default to undefined]
**type** | **number** |  | [optional] [default to undefined]
**layer** | **number** |  | [optional] [default to undefined]
**is_flaky** | **number** |  | [optional] [default to undefined]
**is_muted** | **boolean** | Mute state of the proposed test case. | [optional] [default to undefined]
**suite_id** | **number** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**is_manual** | **boolean** | &#x60;true&#x60; if the case is manual, &#x60;false&#x60; if it is automated. | [optional] [default to undefined]
**is_to_be_automated** | **boolean** | &#x60;true&#x60; if a manual case is planned to be automated. | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**steps_type** | **string** | Format of the steps field. Omit to keep the current one, &#x60;classic&#x60; for a new-case draft; changing it requires sending &#x60;steps&#x60; in the same request. | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | [**Array&lt;ReviewStepData&gt;**](ReviewStepData.md) | For gherkin steps send the scenario in &#x60;value&#x60;. | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**parameters** | [**Array&lt;TestCaseParameterCreate&gt;**](TestCaseParameterCreate.md) |  | [optional] [default to undefined]
**custom_field** | **{ [key: string]: string; }** | Map of custom field ID to value. A &#x60;create&#x60; review must carry every required custom field. An &#x60;edit&#x60; review is validated against the current test case, so send only the fields the proposal changes. | [optional] [default to undefined]

## Example

```typescript
import { ReviewCaseData } from 'qase-api-client';

const instance: ReviewCaseData = {
    title,
    description,
    preconditions,
    postconditions,
    severity,
    priority,
    behavior,
    type,
    layer,
    is_flaky,
    is_muted,
    suite_id,
    milestone_id,
    is_manual,
    is_to_be_automated,
    status,
    steps_type,
    attachments,
    steps,
    tags,
    parameters,
    custom_field,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
