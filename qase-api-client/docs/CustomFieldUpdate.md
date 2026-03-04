# CustomFieldUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**value** | [**Array&lt;CustomFieldCreateValueInner&gt;**](CustomFieldCreateValueInner.md) |  | [optional] [default to undefined]
**replace_values** | **{ [key: string]: string; }** | Dictionary of old values and their replacemants | [optional] [default to undefined]
**placeholder** | **string** |  | [optional] [default to undefined]
**default_value** | **string** |  | [optional] [default to undefined]
**is_filterable** | **boolean** |  | [optional] [default to undefined]
**is_visible** | **boolean** |  | [optional] [default to undefined]
**is_required** | **boolean** |  | [optional] [default to undefined]
**is_enabled_for_all_projects** | **boolean** |  | [optional] [default to undefined]
**projects_codes** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CustomFieldUpdate } from 'qase-api-client';

const instance: CustomFieldUpdate = {
    title,
    value,
    replace_values,
    placeholder,
    default_value,
    is_filterable,
    is_visible,
    is_required,
    is_enabled_for_all_projects,
    projects_codes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
