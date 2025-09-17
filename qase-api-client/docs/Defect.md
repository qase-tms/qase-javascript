# Defect


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**actual_result** | **string** |  | [optional] [default to undefined]
**severity** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**custom_fields** | [**Array&lt;CustomFieldValue&gt;**](CustomFieldValue.md) |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**resolved_at** | **string** |  | [optional] [default to undefined]
**member_id** | **number** | Deprecated, use &#x60;author_id&#x60; instead. | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]
**external_data** | **string** |  | [optional] [default to undefined]
**runs** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**results** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**tags** | [**Array&lt;TagValue&gt;**](TagValue.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**created** | **string** | Deprecated, use the &#x60;created_at&#x60; property instead. | [optional] [default to undefined]
**updated** | **string** | Deprecated, use the &#x60;updated_at&#x60; property instead. | [optional] [default to undefined]

## Example

```typescript
import { Defect } from 'qase-api-client';

const instance: Defect = {
    id,
    title,
    actual_result,
    severity,
    status,
    milestone_id,
    custom_fields,
    attachments,
    resolved_at,
    member_id,
    author_id,
    external_data,
    runs,
    results,
    tags,
    created_at,
    updated_at,
    created,
    updated,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
