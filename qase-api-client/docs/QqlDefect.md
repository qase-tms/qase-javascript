# QqlDefect

Represents a defect entity in Qase Query Language (QQL) format, used for advanced defect filtering and searching.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Internal defect identifier | optional
**defect_id** | **number** | Public defect identifier | required
**title** | **string** | Defect title | optional
**actual_result** | **string** | Actual result description | optional
**severity** | **string** | Defect severity level (e.g., 'blocker', 'critical', 'major', 'minor', 'trivial') | optional
**status** | **string** | Current defect status (e.g., 'open', 'in_progress', 'resolved') | optional
**milestone_id** | **number** | Associated milestone identifier | optional
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | List of custom field values | optional
**attachments** | [**Attachment[]**](Attachment.md) | List of attached files | optional
**resolved** | **Date** | Resolution timestamp | optional
**member_id** | **number** | *(Deprecated)* Use **author_id** instead | optional
**author_id** | **number** | User ID who created the defect | optional
**external_data** | **string** | External system reference data | optional
**tags** | [**TagValue[]**](TagValue.md) | List of associated tags | optional
**created_at** | **Date** | Creation timestamp | optional
**updated_at** | **Date** | Last update timestamp | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
