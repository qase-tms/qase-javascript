# DefectUpdate

Represents the model for updating an existing defect in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | The title of the defect | optional
**actual_result** | **string** | Description of the actual result or issue | optional
**severity** | **number** | Severity level (1 - Blocker, 2 - Critical, 3 - Major, 4 - Normal, 5 - Minor) | optional
**milestone_id** | **number** | ID of the associated milestone | optional
**attachments** | **string[]** | Array of attachment hashes | optional
**custom_field** | **{ [key: string]: string }** | A map of custom fields values (id => value) | optional
**tags** | **string[]** | Array of tag names | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
