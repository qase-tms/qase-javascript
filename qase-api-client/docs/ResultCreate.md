# ResultCreate

Represents the model for creating a new test execution result in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**case_id** | **number** | ID of the test case being executed | optional
**case** | [**ResultCreateCase**](ResultCreateCase.md) | Test case details for dynamic test creation | optional
**status** | **string** | Test execution status: 'passed', 'failed', 'blocked', 'skipped', 'invalid' + custom statuses | required
**start_time** | **number** | Test execution start timestamp (Unix timestamp) | optional
**time** | **number** | Test execution duration in seconds | optional
**time_ms** | **number** | Test execution duration in milliseconds (preferred over 'time') | optional
**defect** | **boolean** | Whether this result should be marked as a defect | optional
**attachments** | **string[]** | List of attachment hashes to link to the result | optional
**stacktrace** | **string** | Error stacktrace for failed tests | optional
**comment** | **string** | Additional comments about the test execution | optional
**param** | **Record<string, string>** | Map of parameters (name => value) for parameterized tests | optional
**param_groups** | **string[][]** | List of parameter groups by name (values in 'param' field) | optional
**steps** | [**TestStepResultCreate[]**](TestStepResultCreate.md) | Results of individual test steps | optional
**author_id** | **number** | ID of the user who executed the test | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
