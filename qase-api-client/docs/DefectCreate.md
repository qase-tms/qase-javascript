# DefectCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**actual_result** | **string** |  | [default to undefined]
**severity** | **number** |  | [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**custom_field** | **{ [key: string]: string; }** | A map of custom fields values (id &#x3D;&gt; value) | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { DefectCreate } from 'qase-api-client';

const instance: DefectCreate = {
    title,
    actual_result,
    severity,
    milestone_id,
    attachments,
    custom_field,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
