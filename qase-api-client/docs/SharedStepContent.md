# SharedStepContent

Represents the content of a shared step in Qase TMS, including the action to perform, expected results, and any associated data or attachments.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** | Unique identifier of the step content | optional
**action** | **string** | Description of the action to perform | optional
**expected_result** | **string** | Expected outcome of the action | optional
**data** | **string** | Additional test data in JSON format | optional
**attachments** | [**AttachmentHash[]**](AttachmentHash.md) | List of attached files | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
