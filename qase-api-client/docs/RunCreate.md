# RunCreate

Represents the model for creating a new test run in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Name of the test run | required
**description** | **string** | Detailed description of the test run | optional
**include_all_cases** | **boolean** | Whether to include all test cases from the project | optional
**cases** | **number[]** | List of specific test case IDs to include | optional
**is_autotest** | **boolean** | Whether this run is for automated tests | optional
**environment_id** | **number** | ID of the environment to use | optional
**environment_slug** | **string** | Slug of the environment to use (alternative to ID) | optional
**milestone_id** | **number** | ID of the milestone to associate with | optional
**plan_id** | **number** | ID of the test plan this run belongs to | optional
**author_id** | **number** | ID of the user creating the run | optional
**tags** | **string[]** | List of tags to assign to the run | optional
**configurations** | **number[]** | List of configuration IDs to use | optional
**custom_field** | **Record<string, string>** | Map of custom field values (id => value) | optional
**start_time** | **string** | Scheduled start time (ISO 8601 format) | optional
**end_time** | **string** | Scheduled end time (ISO 8601 format) | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
