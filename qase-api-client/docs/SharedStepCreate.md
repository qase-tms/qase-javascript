# SharedStepCreate

Represents the request model for creating a new shared step in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Title or name of the shared step | required
**steps** | [**SharedStepContentCreate[]**](SharedStepContentCreate.md) | List of step contents | optional
**action** | **string** | Description of the action to perform (deprecated) | optional
**expected_result** | **string** | Expected outcome of the action (deprecated) | optional
**data** | **string** | Additional test data in JSON format (deprecated) | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
