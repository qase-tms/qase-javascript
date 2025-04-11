# Run

Represents a test run in Qase TMS, which is a collection of test cases to be executed. A test run is the primary way to track test execution progress and results.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the test run | optional
**run_id** | **number** | Legacy identifier for backward compatibility | optional
**title** | **string** | Name of the test run | optional
**description** | **string** | Detailed description of the test run's purpose and scope | optional
**status** | **number** | Current status code of the run (0-active, 1-complete, 2-aborted) | optional
**status_text** | **string** | Human-readable representation of the run status | optional
**start_time** | **Date** | Timestamp when test execution started | optional
**end_time** | **Date** | Timestamp when test execution completed | optional
**public** | **boolean** | Indicates if the run is publicly accessible | optional
**stats** | [**RunStats**](RunStats.md) | Detailed statistics about test execution results | optional
**time_spent** | **number** | Total time spent on test execution (milliseconds) | optional
**elapsed_time** | **number** | Time since run creation (milliseconds) | optional
**environment** | [**RunEnvironment**](RunEnvironment.md) | Environment configuration used for the run | optional
**milestone** | [**RunMilestone**](RunMilestone.md) | Associated milestone details | optional
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Custom field values assigned to the run | optional
**tags** | [**TagValue[]**](TagValue.md) | Tags for run categorization and filtering | optional
**cases** | **number[]** | IDs of test cases included in the run | optional
**plan_id** | **number** | ID of the parent test plan (if created from a plan) | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
