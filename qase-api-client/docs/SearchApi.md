# SearchApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**search**](SearchApi.md#search) | **GET** /search/{code} | Search entities |

## search

Search entities

This method allows to search for entities in the project.

### Example

```typescript
import { SearchApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SearchApi(configuration);

// Search for entities
const params = {
    query: 'login',
    filters: {
        type: ['case', 'defect'],
        status: ['active']
    }
};

const response = await api.search('PROJECT_CODE', params);
console.log(`Total results: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(entity => {
    console.log(`[${entity.type}] ${entity.title}`);
    console.log(`ID: ${entity.id}`);
    console.log(`Status: ${entity.status}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **params** | [**SearchParams**](SearchParams.md) | Search parameters |

### Return type

[**SearchResponse**](SearchResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
