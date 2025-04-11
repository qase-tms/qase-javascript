# DefectCreate

Model for creating a new defect in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Title of the defect. |
**actual_result** | **string** | Actual result or description of the defect. |
**severity** | **number** | Severity level (1-5, where 1 is blocker and 5 is trivial). |
**milestone_id** | **number** | ID of the associated milestone. | [optional]
**attachments** | **string[]** | Array of attachment hashes. | [optional]
**custom_field** | **{ [key: string]: string }** | Map of custom fields values where key is field ID and value is the field value. | [optional]
**tags** | **string[]** | Array of tag names to associate with the defect. | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
