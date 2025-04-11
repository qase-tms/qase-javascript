# DefectQuery

Model for querying and filtering defects in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Internal ID of the defect. | [optional]
**defect_id** | **number** | Public ID of the defect (required). |
**title** | **string** | Title of the defect. | [optional]
**actual_result** | **string** | Actual result or description of the defect. | [optional]
**severity** | **string** | Severity level ('blocker', 'critical', 'major', 'minor', 'trivial'). | [optional]
**status** | **string** | Current status ('open', 'in_progress', 'resolved', 'closed'). | [optional]
**milestone_id** | **number** | ID of the associated milestone. | [optional]
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Array of custom field values. | [optional]
**attachments** | [**Attachment[]**](Attachment.md) | Array of attachments. | [optional]
**resolved** | **Date** | Resolution timestamp. | [optional]
**member_id** | **number** | Deprecated, use `author_id` instead. | [optional]
**author_id** | **number** | ID of the defect author. | [optional]
**external_data** | **string** | External references or data. | [optional]
**tags** | [**TagValue[]**](TagValue.md) | Array of associated tags. | [optional]
**created_at** | **Date** | Creation timestamp. | [optional]
**updated_at** | **Date** | Last update timestamp. | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
