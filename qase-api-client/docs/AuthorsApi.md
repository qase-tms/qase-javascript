# AuthorsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAuthor**](#getauthor) | **GET** /author/{id} | Get a specific author|
|[**getAuthors**](#getauthors) | **GET** /author | Get all authors|

# **getAuthor**
> AuthorResponse getAuthor()

This method allows to retrieve a specific author. 

### Example

```typescript
import {
    AuthorsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AuthorsApi(configuration);

let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getAuthor(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**AuthorResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | An author. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAuthors**
> AuthorListResponse getAuthors()

This method allows to retrieve all authors in selected project. 

### Example

```typescript
import {
    AuthorsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AuthorsApi(configuration);

let search: string; //Provide a string that will be used to search by name. (optional) (default to undefined)
let type: 'app' | 'user'; // (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getAuthors(
    search,
    type,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search** | [**string**] | Provide a string that will be used to search by name. | (optional) defaults to undefined|
| **type** | [**&#39;app&#39; | &#39;user&#39;**]**Array<&#39;app&#39; &#124; &#39;user&#39;>** |  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**AuthorListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Author list. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

