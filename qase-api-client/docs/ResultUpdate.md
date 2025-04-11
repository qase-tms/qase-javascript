# ResultUpdate

Represents the model for updating an existing test result in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Test execution status (passed, failed, blocked, invalid, skipped) | optional
**time_ms** | **number** | Test execution duration in milliseconds | optional
**defect** | **boolean** | Whether this result should be marked as a defect | optional
**attachments** | **string[]** | List of attachment hashes to link to the result | optional
**stacktrace** | **string** | Error stacktrace for failed tests | optional
**comment** | **string** | Additional comments about the test execution | optional
**steps** | [**TestStepResultCreate[]**](TestStepResultCreate.md) | Updated results of individual test steps | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
