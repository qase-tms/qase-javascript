# SharedStep

Represents a reusable test step that can be shared across multiple test cases in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** | Unique identifier of the shared step | optional
**title** | **string** | Title or name of the shared step | optional
**action** | **string** | Description of the action to perform | optional
**expected_result** | **string** | Expected outcome of the action | optional
**steps** | [**SharedStepContent[]**](SharedStepContent.md) | List of sub-steps if this is a multi-step action | optional
**data** | **string** | Additional test data for the step | optional
**cases** | **number[]** | List of test case IDs using this shared step | optional
**cases_count** | **number** | Total number of test cases using this step | optional
**created_at** | **Date** | Creation timestamp | optional
**updated_at** | **Date** | Last update timestamp | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
