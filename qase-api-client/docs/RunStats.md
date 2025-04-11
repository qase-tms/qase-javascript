# RunStats

Represents statistics about test case execution results within a test run in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** | Total number of test cases in the run | [optional]
**statuses** | **{ [key: string]: number }** | Map of status names to their counts | [optional]
**untested** | **number** | Number of test cases not yet executed | [optional]
**passed** | **number** | Number of passed test cases | [optional]
**failed** | **number** | Number of failed test cases | [optional]
**blocked** | **number** | Number of blocked test cases | [optional]
**skipped** | **number** | Number of skipped test cases | [optional]
**retest** | **number** | Number of test cases marked for retest | [optional]
**in_progress** | **number** | Number of test cases currently being executed | [optional]
**invalid** | **number** | Number of invalid test cases | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
