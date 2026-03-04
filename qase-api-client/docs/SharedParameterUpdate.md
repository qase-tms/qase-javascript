# SharedParameterUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**project_codes** | **Array&lt;string&gt;** | List of project codes to associate with this shared parameter | [optional] [default to undefined]
**is_enabled_for_all_projects** | **boolean** |  | [optional] [default to undefined]
**parameters** | [**SharedParameterParameter**](SharedParameterParameter.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SharedParameterUpdate } from 'qase-api-client';

const instance: SharedParameterUpdate = {
    title,
    project_codes,
    is_enabled_for_all_projects,
    parameters,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
