# CustomField

## Description

Model representing a custom field in Qase TMS.

## Properties

| Name | Type | Description |
|------|------|-------------|
| **id** | **number** | Unique identifier of the custom field |
| **title** | **string** | Display title of the custom field |
| **entity** | **string** | Entity type this field belongs to |
| **type** | **string** | Type of the custom field (e.g., 'string', 'select', 'checkbox') |
| **placeholder** | **string** | Placeholder text for the field |
| **default_value** | **string** | Default value of the field |
| **value** | **string** | Current value of the field |
| **is_required** | **boolean** | Whether the field is required |
| **is_visible** | **boolean** | Whether the field is visible |
| **is_filterable** | **boolean** | Whether the field can be used in filters |
| **is_enabled_for_all_projects** | **boolean** | Whether the field is enabled |
| **created_at** | **string** | Creation timestamp |
| **updated_at** | **string** | Last update timestamp |
| **projects_codes** | **string[]** | ID of the project this field belongs to |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
