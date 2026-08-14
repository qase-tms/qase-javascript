# ReviewProposedStep


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | **string** | Step action text. Used for classic steps. For gherkin steps, use the \&quot;value\&quot; property instead. | [optional] [default to undefined]
**expected_result** | **string** |  | [optional] [default to undefined]
**data** | **string** |  | [optional] [default to undefined]
**value** | **string** | Gherkin scenario text. Used when steps_type is \&quot;gherkin\&quot;. | [optional] [default to undefined]
**shared** | **string** | Hash of the referenced shared step. | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | **Array&lt;object&gt;** | Nested steps use the same structure. | [optional] [default to undefined]

## Example

```typescript
import { ReviewProposedStep } from 'qase-api-client';

const instance: ReviewProposedStep = {
    action,
    expected_result,
    data,
    value,
    shared,
    attachments,
    steps,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
