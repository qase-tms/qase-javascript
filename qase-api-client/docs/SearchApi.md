# SearchApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**search**](#search) | **GET** /search | Search entities by Qase Query Language (QQL)|

# **search**
> SearchResponse search()

This method allows to retrieve data sets for various entities using expressions with conditions. 

### Example

```typescript
import {
    SearchApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let query: string; //Expression in Qase Query Language. (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.search(
    query,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **query** | [**string**] | Expression in Qase Query Language. | defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**SearchResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of found entities. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

