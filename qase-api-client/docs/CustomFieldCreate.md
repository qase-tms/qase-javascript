# CustomFieldCreate

## Description

Model for creating a new custom field in Qase TMS.

## Properties

| Name | Type | Description |
|------|------|-------------|
| **title** | **string** | Display title of the custom field (required) |
| **type** | **string** | Type of the custom field (required) |
| **value** | [**CustomFieldCreateValueInner[]**](CustomFieldCreateValueInner.md) | Array of possible values for select-type fields |
| **entity** | **string** | Entity type this field belongs to (required) |
| **placeholder** | **string** | Placeholder text for the field |
| **default_value** | **string** | Default value of the field |
| **is_required** | **boolean** | Whether the field is required |
| **is_visible** | **boolean** | Whether the field is visible |
| **is_filterable** | **boolean** | Whether the field can be used in filters |
| **is_enabled_for_all_projects** | **boolean** | Whether the field is enabled |
| **projects_codes** | **string[]** | ID of the project this field belongs to |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
