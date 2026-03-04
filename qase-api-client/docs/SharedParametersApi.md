# SharedParametersApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSharedParameter**](#createsharedparameter) | **POST** /shared_parameter | Create a new shared parameter|
|[**deleteSharedParameter**](#deletesharedparameter) | **DELETE** /shared_parameter/{id} | Delete shared parameter|
|[**getSharedParameter**](#getsharedparameter) | **GET** /shared_parameter/{id} | Get a specific shared parameter|
|[**getSharedParameters**](#getsharedparameters) | **GET** /shared_parameter | Get all shared parameters|
|[**updateSharedParameter**](#updatesharedparameter) | **PATCH** /shared_parameter/{id} | Update shared parameter|

# **createSharedParameter**
> UuidResponse createSharedParameter(sharedParameterCreate)


### Example

```typescript
import {
    SharedParametersApi,
    Configuration,
    SharedParameterCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedParametersApi(configuration);

let sharedParameterCreate: SharedParameterCreate; //

const { status, data } = await apiInstance.createSharedParameter(
    sharedParameterCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sharedParameterCreate** | **SharedParameterCreate**|  | |


### Return type

**UuidResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A shared parameter. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSharedParameter**
> UuidResponse1 deleteSharedParameter()

Delete shared parameter along with all its usages in test cases and reviews.

### Example

```typescript
import {
    SharedParametersApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedParametersApi(configuration);

let id: string; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteSharedParameter(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Identifier. | defaults to undefined|


### Return type

**UuidResponse1**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSharedParameter**
> SharedParameterResponse getSharedParameter()


### Example

```typescript
import {
    SharedParametersApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedParametersApi(configuration);

let id: string; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getSharedParameter(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Identifier. | defaults to undefined|


### Return type

**SharedParameterResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A shared parameter. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSharedParameters**
> SharedParameterListResponse getSharedParameters()


### Example

```typescript
import {
    SharedParametersApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedParametersApi(configuration);

let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)
let filtersSearch: string; // (optional) (default to undefined)
let filtersType: 'single' | 'group'; // (optional) (default to undefined)
let filtersProjectCodes: Array<string>; // (optional) (default to undefined)

const { status, data } = await apiInstance.getSharedParameters(
    limit,
    offset,
    filtersSearch,
    filtersType,
    filtersProjectCodes
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|
| **filtersSearch** | [**string**] |  | (optional) defaults to undefined|
| **filtersType** | [**&#39;single&#39; | &#39;group&#39;**]**Array<&#39;single&#39; &#124; &#39;group&#39;>** |  | (optional) defaults to undefined|
| **filtersProjectCodes** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|


### Return type

**SharedParameterListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all shared parameters. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSharedParameter**
> UuidResponse1 updateSharedParameter(sharedParameterUpdate)


### Example

```typescript
import {
    SharedParametersApi,
    Configuration,
    SharedParameterUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedParametersApi(configuration);

let id: string; //Identifier. (default to undefined)
let sharedParameterUpdate: SharedParameterUpdate; //

const { status, data } = await apiInstance.updateSharedParameter(
    id,
    sharedParameterUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sharedParameterUpdate** | **SharedParameterUpdate**|  | |
| **id** | [**string**] | Identifier. | defaults to undefined|


### Return type

**UuidResponse1**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

