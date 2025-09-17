# Runupdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**environment_id** | **number** |  | [optional] [default to undefined]
**environment_slug** | **string** |  | [optional] [default to undefined]
**milestone_id** | **number** |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**configurations** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**custom_field** | **{ [key: string]: string; }** | A map of custom fields values (id &#x3D;&gt; value) | [optional] [default to undefined]

## Example

```typescript
import { Runupdate } from 'qase-api-client';

const instance: Runupdate = {
    title,
    description,
    environment_id,
    environment_slug,
    milestone_id,
    tags,
    configurations,
    custom_field,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
