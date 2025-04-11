# SearchResponseAllOfResult

Represents the result portion of a search response, containing the found entities and pagination information.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**entities** | [**Array<SearchResponseAllOfResultEntities>**](SearchResponseAllOfResultEntities.md) | List of found entities matching the search criteria | required
**total** | **number** | Total number of entities matching the search criteria | required
**filtered** | **number** | Number of entities after applying filters | optional
**count** | **number** | Number of entities in the current page | optional

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
