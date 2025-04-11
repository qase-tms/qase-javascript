# ResultQuery

Represents a query model for searching and filtering test results in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hash** | **string** | Unique hash identifier for the result | optional
**result_hash** | **string** | Alternative hash identifier for the result | required
**comment** | **string** | Additional comments about the test execution | optional
**stacktrace** | **string** | Error stacktrace for failed tests | optional
**run_id** | **number** | ID of the test run this result belongs to | optional
**case_id** | **number** | ID of the test case that was executed | optional
**steps** | [**TestStepResult[]**](TestStepResult.md) | Results of individual test steps | optional
**status** | **string** | Test execution status (passed, failed, blocked, invalid, skipped) | optional
**is_api_result** | **boolean** | Whether the result was submitted via API | optional
**time_spent_ms** | **number** | Test execution duration in milliseconds | optional
**end_time** | **Date** | Test execution completion timestamp | optional
**attachments** | [**Attachment[]**](Attachment.md) | List of attached files (logs, screenshots, etc.) | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
