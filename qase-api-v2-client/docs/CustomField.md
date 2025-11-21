# CustomField


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**entity** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**placeholder** | **string** |  | [optional] [default to undefined]
**default_value** | **string** |  | [optional] [default to undefined]
**value** | [**Array&lt;CustomFieldOption&gt;**](CustomFieldOption.md) |  | [optional] [default to undefined]
**is_required** | **boolean** |  | [optional] [default to undefined]
**is_visible** | **boolean** |  | [optional] [default to undefined]
**is_filterable** | **boolean** |  | [optional] [default to undefined]
**is_enabled_for_all_projects** | **boolean** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**projects_codes** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CustomField } from 'qase-api-v2-client';

const instance: CustomField = {
    id,
    title,
    entity,
    type,
    placeholder,
    default_value,
    value,
    is_required,
    is_visible,
    is_filterable,
    is_enabled_for_all_projects,
    created_at,
    updated_at,
    projects_codes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
