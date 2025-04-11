# SystemField

## Description

System field model represents a predefined field in Qase TMS that can be used across different entities.

## Properties

| Name | Type | Description |
|------|------|-------------|
| **title** | **string** | Title of the system field |
| **slug** | **string** | Slug of the system field |
| **entity** | **string** | Entity type this field belongs to (e.g., 'case', 'run', 'defect') |
| **type** | **string** | Field type (e.g., 'text', 'number', 'select') |
| **default_value** | **string** | Default value for the field |
| **is_required** | **boolean** | Whether the field is required |
| **options** | **SystemFieldOption[]** | List of options for the field |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
