# SearchResponseAllOfResultEntities

Represents an entity returned in search results from Qase TMS. This model can represent different types of entities including test cases, test runs, defects, and more.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique identifier of the entity | optional
**type** | **string** | Type of the entity (case, run, defect, etc.) | optional
**title** | **string** | Title or name of the entity | optional
**description** | **string** | Detailed description of the entity | optional
**status** | **string** | Current status of the entity | optional
**status_text** | **string** | Human-readable status representation | optional
**project_code** | **string** | Code of the project the entity belongs to | optional

### Test Run Specific Fields

**run_id** | **number** | Unique identifier of the test run | optional
**start_time** | **Date** | When the test run started | optional
**end_time** | **Date** | When the test run completed | optional
**public** | **boolean** | Whether the run is publicly accessible | optional
**stats** | [**RunStats**](RunStats.md) | Test execution statistics | optional
**time_spent** | **number** | Time spent in milliseconds | optional
**elapsed_time** | **number** | Total elapsed time in milliseconds | optional
**environment** | [**RunEnvironment**](RunEnvironment.md) | Environment configuration | optional
**milestone** | [**RunMilestone**](RunMilestone.md) | Associated milestone | optional

### Test Case Specific Fields

**case_id** | **number** | Unique identifier of the test case | optional
**suite_id** | **number** | ID of the test suite containing the case | optional
**priority** | **number** | Test case priority level | optional
**severity** | **string** | Test case severity level | optional
**behavior** | **number** | Test case behavior type | optional
**automation** | **number** | Automation status | optional
**is_flaky** | **number** | Whether the test case is marked as flaky | optional
**preconditions** | **string** | Test case preconditions | optional
**postconditions** | **string** | Test case postconditions | optional
**params** | [**TestCaseParams**](TestCaseParams.md) | Test case parameters | optional

### Test Result Specific Fields

**result_hash** | **string** | Unique hash of the test result | optional
**comment** | **string** | Result comment or notes | optional
**stacktrace** | **string** | Error stacktrace if failed | optional
**steps** | [**TestStep[]**](TestStep.md) | Test execution steps | optional
**is_api_result** | **boolean** | Whether result was submitted via API | optional
**attachments** | [**Attachment[]**](Attachment.md) | Attached files | optional

### Common Fields

**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Custom field values | optional
**tags** | [**TagValue[]**](TagValue.md) | Associated tags | optional
**created_at** | **Date** | Creation timestamp | optional
**updated_at** | **Date** | Last update timestamp | optional
**author_id** | **number** | ID of the entity creator | optional
**updated_by** | **number** | ID of the user who last updated the entity | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
