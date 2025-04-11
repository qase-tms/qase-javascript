# RunQuery

Represents a query model for searching and filtering test runs in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the test run | optional
**run_id** | **number** | Legacy identifier for backward compatibility | required
**title** | **string** | Name of the test run | optional
**description** | **string** | Detailed description of the test run | optional
**status** | **number** | Current status code (0-active, 1-complete, 2-aborted) | optional
**status_text** | **string** | Human-readable status representation | optional
**start_time** | **Date** | When the test run execution started | optional
**end_time** | **Date** | When the test run execution completed | optional
**public** | **boolean** | Whether the run is publicly accessible | optional
**stats** | [**RunStats**](RunStats.md) | Statistics about test execution results | optional
**time_spent** | **number** | Total execution time in milliseconds | optional
**elapsed_time** | **number** | Time since run creation in milliseconds | optional
**environment** | [**RunEnvironment**](RunEnvironment.md) | Environment configuration for the run | optional
**milestone** | [**RunMilestone**](RunMilestone.md) | Associated milestone information | optional
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Custom field values for the run | optional
**tags** | [**TagValue[]**](TagValue.md) | Tags associated with the run | optional
**cases** | **number[]** | List of test case IDs included in the run | optional
**plan_id** | **number** | ID of the test plan this run belongs to | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
