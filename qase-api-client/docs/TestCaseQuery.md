# TestCaseQuery

## Description

Model representing a test case query for filtering and searching test cases in Qase TMS.

## Properties

| Name | Type | Description |
|------|------|-------------|
| **id** | **number** | Test case ID |
| **test_case_id** | **number** | Test case ID (required) |
| **position** | **number** | Position in the test suite |
| **title** | **string** | Test case title |
| **description** | **string** | Test case description |
| **preconditions** | **string** | Test case preconditions |
| **postconditions** | **string** | Test case postconditions |
| **severity** | **number** | Test case severity level |
| **priority** | **number** | Test case priority level |
| **type** | **number** | Test case type |
| **layer** | **number** | Test case layer |
| **is_flaky** | **number** | Whether the test case is flaky |
| **behavior** | **number** | Test case behavior |
| **automation** | **number** | Test case automation status |
| **status** | **number** | Test case status |
| **milestone_id** | **number** | Associated milestone ID |
| **suite_id** | **number** | Parent suite ID |
| **custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | Custom field values |
| **attachments** | [**Attachment[]**](Attachment.md) | Attached files |
| **steps_type** | **string** | Type of test steps |
| **steps** | [**TestStep[]**](TestStep.md) | Test steps |
| **params** | [**TestCaseParams**](TestCaseParams.md) | Additional query parameters |
| **tags** | [**TagValue[]**](TagValue.md) | Associated tags |
| **member_id** | **number** | Deprecated, use **author_id** instead |
| **author_id** | **number** | Test case author ID |
| **created_at** | **string** | Creation timestamp |
| **updated_at** | **string** | Last update timestamp |
| **updated_by** | **number** | ID of the user who last updated the test case |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
