# SharedParameterCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**type** | **string** |  | [default to undefined]
**is_enabled_for_all_projects** | **boolean** |  | [default to undefined]
**parameters** | [**SharedParameterParameter**](SharedParameterParameter.md) |  | [default to undefined]
**project_codes** | **Array&lt;string&gt;** | List of project codes to associate with this shared parameter | [optional] [default to undefined]

## Example

```typescript
import { SharedParameterCreate } from 'qase-api-client';

const instance: SharedParameterCreate = {
    title,
    type,
    is_enabled_for_all_projects,
    parameters,
    project_codes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
