# ResultCreateCase

Represents a model for creating a dynamic test case during result submission. Can be used instead of **case_id** when submitting test results for cases that don't exist yet.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Title of the test case | optional
**suite_title** | **string** | Path to the test suite (nested suites separated with TAB character) | optional
**description** | **string** | Detailed description of the test case | optional
**preconditions** | **string** | Steps or conditions required before test execution | optional
**postconditions** | **string** | Steps or conditions to perform after test execution | optional
**layer** | **string** | Test layer slug (e.g., 'unit', 'integration', 'e2e', 'api') | optional
**severity** | **string** | Test severity slug (e.g., 'critical', 'major', 'minor') | optional
**priority** | **string** | Test priority slug (e.g., 'high', 'medium', 'low') | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
