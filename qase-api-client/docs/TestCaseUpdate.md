# TestCaseUpdate

## Description

Model for updating an existing test case in Qase TMS.

## Properties

| Name | Type | Description |
|------|------|-------------|
| **description** | **string** | Test case description |
| **preconditions** | **string** | Test case preconditions |
| **postconditions** | **string** | Test case postconditions |
| **title** | **string** | Test case title |
| **severity** | **number** | Test case severity level |
| **priority** | **number** | Test case priority level |
| **behavior** | **number** | Test case behavior |
| **type** | **number** | Test case type |
| **layer** | **number** | Test case layer |
| **is_flaky** | **number** | Whether the test case is flaky |
| **suite_id** | **number** | Parent suite ID |
| **milestone_id** | **number** | Associated milestone ID |
| **automation** | **number** | Test case automation status |
| **status** | **number** | Test case status |
| **attachments** | **string[]** | Array of attachment hashes |
| **steps** | [**TestStepCreate[]**](TestStepCreate.md) | Test steps |
| **tags** | **string[]** | Array of tag titles |
| **params** | **Record<string, string[]>** | Test parameters |
| **custom_field** | **Record<string, string>** | Map of custom field values (id => value) |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
