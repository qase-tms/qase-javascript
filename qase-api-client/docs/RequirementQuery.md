# RequirementQuery

Represents a query model for searching and filtering requirements in Qase TMS.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Internal requirement identifier for filtering | optional
**requirement_id** | **number** | Public requirement identifier for filtering | required
**parent_id** | **number** | Filter by parent requirement | optional
**member_id** | **number** | Filter by creator user ID | optional
**title** | **string** | Filter by requirement title (supports partial match) | optional
**description** | **string** | Filter by requirement description (supports partial match) | optional
**status** | **string** | Filter by requirement status | optional
**type** | **string** | Filter by requirement type | optional
**created_at** | **Date** | Filter by creation date | optional
**updated_at** | **Date** | Filter by last update date | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
