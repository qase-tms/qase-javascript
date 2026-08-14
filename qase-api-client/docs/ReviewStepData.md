# ReviewStepData

A step of the proposed test case. When `steps_type` is `gherkin` the step carries the scenario in `value` and nothing else: a non-empty `action`, `expected_result`, `data`, `attachments`, `shared` or nested `steps` is rejected.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | **string** | Step action text. Classic steps only. | [optional] [default to undefined]
**shared** | **string** | Hash of an existing shared step to insert at this position. | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**value** | **string** | Gherkin scenario text. Used when steps_type is \&quot;gherkin\&quot;. Example: \&quot;Given a user exists\\nWhen they log in\\nThen they see the dashboard\&quot; | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps may be passed here. Use same structure for them. | [optional] [default to undefined]

## Example

```typescript
import { ReviewStepData } from 'qase-api-client';

const instance: ReviewStepData = {
    action,
    shared,
    expected_result,
    data,
    value,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
