# TestCase


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**position** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**severity** | **number** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**type** | **number** |  | [optional] [default to undefined]
**layer** | **number** |  | [optional] [default to undefined]
**is_flaky** | **number** |  | [optional] [default to undefined]
**behavior** | **number** |  | [optional] [default to undefined]
**automation** | **number** | Deprecated, use &#x60;isManual&#x60; and &#x60;isToBeAutomated&#x60; instead. Encodes the test case automation state as a single integer: &#x60;0&#x60; &#x3D; manual, &#x60;1&#x60; &#x3D; manual planned to be automated, &#x60;2&#x60; &#x3D; automated. | [optional] [default to undefined]
**isManual** | **number** | &#x60;1&#x60; if the case is manual, &#x60;0&#x60; if it is automated. Combined with &#x60;isToBeAutomated&#x60;, replaces the deprecated &#x60;automation&#x60; field. | [optional] [default to undefined]
**isToBeAutomated** | **number** | &#x60;1&#x60; if a manual case is planned to be automated, &#x60;0&#x60; otherwise. Only meaningful when &#x60;isManual &#x3D; 1&#x60;; ignored when &#x60;isManual &#x3D; 0&#x60;. | [optional] [default to undefined]
**status** | **number** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**suite_id** | **number** |  | [optional] [default to undefined]
**custom_fields** | [**Array&lt;CustomFieldValue&gt;**](CustomFieldValue.md) |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**steps_type** | **string** |  | [optional] [default to undefined]
**steps** | [**Array&lt;TestStep&gt;**](TestStep.md) |  | [optional] [default to undefined]
**params** | [**TestCaseParams**](TestCaseParams.md) |  | [optional] [default to undefined]
**parameters** | [**Array&lt;TestCaseParameter&gt;**](TestCaseParameter.md) |  | [optional] [default to undefined]
**tags** | [**Array&lt;TagValue&gt;**](TagValue.md) |  | [optional] [default to undefined]
**member_id** | **number** | Deprecated, use &#x60;author_id&#x60; instead. | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**deleted** | **string** |  | [optional] [default to undefined]
**created** | **string** | Deprecated, use the &#x60;created_at&#x60; property instead. | [optional] [default to undefined]
**updated** | **string** | Deprecated, use the &#x60;updated_at&#x60; property instead. | [optional] [default to undefined]
**external_issues** | [**Array&lt;ExternalIssue&gt;**](ExternalIssue.md) |  | [optional] [default to undefined]

## Example

```typescript
import { TestCase } from 'qase-api-client';

const instance: TestCase = {
    id,
    position,
    title,
    description,
    preconditions,
    postconditions,
    severity,
    priority,
    type,
    layer,
    is_flaky,
    behavior,
    automation,
    isManual,
    isToBeAutomated,
    status,
    milestone_id,
    suite_id,
    custom_fields,
    attachments,
    steps_type,
    steps,
    params,
    parameters,
    tags,
    member_id,
    author_id,
    created_at,
    updated_at,
    deleted,
    created,
    updated,
    external_issues,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
