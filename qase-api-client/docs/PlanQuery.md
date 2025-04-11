# PlanQuery

Represents a query model for filtering test plans in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the test plan | optional
**plan_id** | **number** | Legacy identifier of the test plan | required
**title** | **string** | Title of the test plan to search for | optional
**description** | **string** | Description text to search for | optional
**cases_count** | **number** | Filter by number of test cases | optional
**created_at** | **string** | Filter by creation date (ISO 8601) | optional
**updated_at** | **string** | Filter by last update date (ISO 8601) | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
