# Defect

Model representing a defect in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the defect. | [optional]
**title** | **string** | Title of the defect. | [optional]
**actual_result** | **string** | Actual result or description of the defect. | [optional]
**severity** | **string** | Severity level of the defect (e.g., 'blocker', 'critical', 'major', 'minor', 'trivial'). | [optional]
**status** | **string** | Current status of the defect (e.g., 'open', 'in_progress', 'resolved'). | [optional]
**milestone_id** | **number** | ID of the associated milestone. | [optional]
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Array of custom field values associated with the defect. | [optional]
**attachments** | [**Attachment[]**](Attachment.md) | Array of attachments associated with the defect. | [optional]
**resolved_at** | **Date** | Timestamp when the defect was resolved. | [optional]
**member_id** | **number** | Deprecated, use `author_id` instead. | [optional]
**author_id** | **number** | ID of the user who created the defect. | [optional]
**external_data** | **string** | External data or references associated with the defect. | [optional]
**runs** | **number[]** | Array of test run IDs associated with the defect. | [optional]
**results** | **string[]** | Array of test result IDs associated with the defect. | [optional]
**tags** | [**TagValue[]**](TagValue.md) | Array of tags associated with the defect. | [optional]
**created_at** | **Date** | Timestamp when the defect was created. | [optional]
**updated_at** | **Date** | Timestamp when the defect was last updated. | [optional]
**created** | **string** | Deprecated, use the `created_at` property instead. | [optional]
**updated** | **string** | Deprecated, use the `updated_at` property instead. | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
