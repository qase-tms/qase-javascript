# CustomFieldCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**entity** | **number** | Possible values: 0 - case; 1 - run; 2 - defect;  | [default to undefined]
**type** | **number** | Possible values: 0 - number; 1 - string; 2 - text; 3 - selectbox; 4 - checkbox; 5 - radio; 6 - multiselect; 7 - url; 8 - user; 9 - datetime;  | [default to undefined]
**value** | [**Array&lt;CustomFieldCreateValueInner&gt;**](CustomFieldCreateValueInner.md) | Required if type one of: 3 - selectbox; 5 - radio; 6 - multiselect;  | [optional] [default to undefined]
**placeholder** | **string** |  | [optional] [default to undefined]
**default_value** | **string** |  | [optional] [default to undefined]
**is_filterable** | **boolean** |  | [optional] [default to undefined]
**is_visible** | **boolean** |  | [optional] [default to undefined]
**is_required** | **boolean** |  | [optional] [default to undefined]
**is_enabled_for_all_projects** | **boolean** |  | [optional] [default to undefined]
**projects_codes** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CustomFieldCreate } from 'qase-api-client';

const instance: CustomFieldCreate = {
    title,
    entity,
    type,
    value,
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
