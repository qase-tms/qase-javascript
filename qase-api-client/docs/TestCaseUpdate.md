# TestCaseUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**description** | **string** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**severity** | **number** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**behavior** | **number** |  | [optional] [default to undefined]
**type** | **number** |  | [optional] [default to undefined]
**layer** | **number** |  | [optional] [default to undefined]
**is_flaky** | **number** |  | [optional] [default to undefined]
**suite_id** | **number** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**automation** | **number** |  | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** | A list of Attachment hashes. | [optional] [default to undefined]
**steps** | [**Array&lt;TestStepCreate&gt;**](TestStepCreate.md) |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**params** | **{ [key: string]: Array&lt;string&gt;; }** | Deprecated, use &#x60;parameters&#x60; instead. | [optional] [default to undefined]
**parameters** | [**Array&lt;TestCaseParameterCreate&gt;**](TestCaseParameterCreate.md) |  | [optional] [default to undefined]
**custom_field** | **{ [key: string]: string; }** | A map of custom fields values (id &#x3D;&gt; value) | [optional] [default to undefined]

## Example

```typescript
import { TestCaseUpdate } from 'qase-api-client';

const instance: TestCaseUpdate = {
    description,
    preconditions,
    postconditions,
    title,
    severity,
    priority,
    behavior,
    type,
    layer,
    is_flaky,
    suite_id,
    milestone_id,
    automation,
    status,
    attachments,
    steps,
    tags,
    params,
    parameters,
    custom_field,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
