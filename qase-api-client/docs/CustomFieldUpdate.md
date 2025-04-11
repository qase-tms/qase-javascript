# CustomFieldUpdate

Model for updating an existing custom field in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Display name of the custom field. |
**value** | [**CustomFieldCreateValueInner[]**](CustomFieldCreateValueInner.md) | Array of possible values for selectbox, radio, or multiselect fields. | [optional]
**replace_values** | **{ [key: string]: string }** | Dictionary of old values and their replacements for updating existing field values. | [optional]
**placeholder** | **string** | Placeholder text for the field. | [optional]
**default_value** | **string** | Default value for the field. | [optional]
**is_filterable** | **boolean** | Whether the field can be used for filtering. | [optional]
**is_visible** | **boolean** | Whether the field is visible to users. | [optional]
**is_required** | **boolean** | Whether the field is required to be filled. | [optional]
**is_enabled_for_all_projects** | **boolean** | Whether the field is available in all projects. | [optional]
**projects_codes** | **string[]** | List of project codes where this field should be available. | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
