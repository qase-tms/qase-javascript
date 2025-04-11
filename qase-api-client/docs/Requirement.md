# Requirement

Represents a requirement entity in Qase TMS, used to define and track project requirements.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Internal requirement identifier | optional
**requirement_id** | **number** | Public requirement identifier | optional
**parent_id** | **number** | Parent requirement identifier for hierarchical organization | optional
**member_id** | **number** | User ID who created the requirement | optional
**title** | **string** | Requirement title | optional
**description** | **string** | Detailed requirement description | optional
**status** | **string** | Current requirement status (e.g., 'draft', 'actual', 'review', 'approved') | optional
**type** | **string** | Requirement type (e.g., 'functional', 'non-functional', 'business', 'technical') | optional
**created_at** | **Date** | Creation timestamp | optional
**updated_at** | **Date** | Last update timestamp | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
