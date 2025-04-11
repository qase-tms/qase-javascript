# QqlTestCase

Represents a test case entity in Qase Query Language (QQL) format, used for advanced test case filtering and searching.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Internal test case identifier | optional
**test_case_id** | **number** | Public test case identifier | required
**position** | **number** | Position in the test suite | optional
**title** | **string** | Test case title | optional
**description** | **string** | Test case description | optional
**preconditions** | **string** | Test case preconditions | optional
**postconditions** | **string** | Test case postconditions | optional
**severity** | **number** | Severity level (0-6: undefined, blocker, critical, major, normal, minor, trivial) | optional
**priority** | **number** | Priority level (0-3: undefined, high, medium, low) | optional
**type** | **number** | Test case type (0-11: other, functional, smoke, regression, security, etc.) | optional
**layer** | **number** | Test layer (0-4: undefined, e2e, api, unit, integration) | optional
**is_flaky** | **number** | Flaky test flag (0-1) | optional
**behavior** | **number** | Behavior type (0-4: undefined, positive, negative, destructive, boundary) | optional
**automation** | **number** | Automation status (0-3: undefined, automated, to be automated, not automated) | optional
**status** | **number** | Test case status (0-4: undefined, actual, draft, deprecated, review) | optional
**milestone_id** | **number** | Associated milestone identifier | optional
**suite_id** | **number** | Parent test suite identifier | optional
**custom_fields** | [**CustomFieldValue[]**](CustomFieldValue.md) | List of custom field values | optional
**attachments** | [**Attachment[]**](Attachment.md) | List of attached files | optional
**steps_type** | **string** | Type of test case steps ('classic' or 'table') | optional
**steps** | [**TestStep[]**](TestStep.md) | List of test case steps | optional
**params** | [**TestCaseParams**](TestCaseParams.md) | Test case parameters for data-driven testing | optional
**tags** | [**TagValue[]**](TagValue.md) | List of associated tags | optional
**member_id** | **number** | *(Deprecated)* Use **author_id** instead | optional
**author_id** | **number** | User ID who created the test case | optional
**created_at** | **Date** | Creation timestamp | optional
**updated_at** | **Date** | Last update timestamp | optional
**updated_by** | **number** | User ID who last updated the test case | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
