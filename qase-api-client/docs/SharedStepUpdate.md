# SharedStepUpdate

Represents the request model for updating an existing shared step in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Title of the shared step |
**action** | **string** | Deprecated, use the `steps` property instead. Single step action description. | [optional]
**expected_result** | **string** | Deprecated, use the `steps` property instead. Single step expected result. | [optional]
**data** | **string** | Deprecated, use the `steps` property instead. Single step test data. | [optional]
**steps** | [**SharedStepContentCreate[]**](SharedStepContentCreate.md) | Array of step objects containing action, expected result, and data | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
