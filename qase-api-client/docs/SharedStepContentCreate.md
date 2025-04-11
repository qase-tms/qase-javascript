# SharedStepContentCreate

Represents the request model for creating content of a shared step in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** | Unique identifier for the step content | optional
**action** | **string** | Description of the action to perform | required
**expected_result** | **string** | Expected outcome of the action | optional
**data** | **string** | Additional test data in JSON format | optional
**attachments** | **string[]** | List of attachment hashes to associate with the step | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
