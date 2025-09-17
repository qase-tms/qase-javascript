# QqlDefect


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**defect_id** | **number** |  | [default to undefined]
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**actual_result** | **string** |  | [optional] [default to undefined]
**severity** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**custom_fields** | [**Array&lt;CustomFieldValue&gt;**](CustomFieldValue.md) |  | [optional] [default to undefined]
**attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] [default to undefined]
**resolved** | **string** |  | [optional] [default to undefined]
**member_id** | **number** | Deprecated, use &#x60;author_id&#x60; instead. | [optional] [default to undefined]
**author_id** | **number** |  | [optional] [default to undefined]
**external_data** | **string** |  | [optional] [default to undefined]
**tags** | [**Array&lt;TagValue&gt;**](TagValue.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { QqlDefect } from 'qase-api-client';

const instance: QqlDefect = {
    defect_id,
    id,
    title,
    actual_result,
    severity,
    status,
    milestone_id,
    custom_fields,
    attachments,
    resolved,
    member_id,
    author_id,
    external_data,
    tags,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
