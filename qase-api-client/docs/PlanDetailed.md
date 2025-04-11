# PlanDetailed

Represents a detailed test plan entity with additional information in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the test plan | optional
**title** | **string** | Name of the test plan | optional
**description** | **string** | Detailed description of the test plan | optional
**cases_count** | **number** | Number of test cases in the plan | optional
**created_at** | **string** | Creation date in ISO 8601 format | optional
**updated_at** | **string** | Last update date in ISO 8601 format | optional
**created** | **string** | Creation date (deprecated, use created_at) | optional
**updated** | **string** | Update date (deprecated, use updated_at) | optional
**average_time** | **number** | Average execution time in seconds | optional
**cases** | [**PlanDetailedAllOfCases[]**](PlanDetailedAllOfCases.md) | Array of detailed test case objects | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
