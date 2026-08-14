# ReviewProposedCase

The test case state proposed by the review. Only the fields the proposal carries are present.

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
**is_muted** | **boolean** |  | [optional] [default to undefined]
**suite_id** | **number** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**is_manual** | **boolean** | &#x60;true&#x60; if the case is manual, &#x60;false&#x60; if it is automated. | [optional] [default to undefined]
**is_to_be_automated** | **boolean** | &#x60;true&#x60; if a manual case is planned to be automated. | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**steps_type** | **string** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | Attachment hashes. | [optional] [default to undefined]
**steps** | [**Array&lt;ReviewProposedStep&gt;**](ReviewProposedStep.md) |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**parameters** | [**Array&lt;TestCaseParameter&gt;**](TestCaseParameter.md) |  | [optional] [default to undefined]
**custom_fields** | [**Array&lt;CustomFieldValue&gt;**](CustomFieldValue.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ReviewProposedCase } from 'qase-api-client';

const instance: ReviewProposedCase = {
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
    custom_fields,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
