# TestStepResult

Represents the result of a test step execution in Qase TMS, including status, position, attachments, and nested steps results.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | Status code of the step execution (0 - untested, 1 - passed, 2 - failed, 3 - blocked, 4 - skipped) | [optional]
**position** | **number** | Position of the step in the test case | [optional]
**attachments** | [**Attachment[]**](Attachment.md) | Array of attachments related to the step result | [optional]
**steps** | **object[]** | Nested steps results with the same structure as parent step | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
