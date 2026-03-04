# EnvironmentsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createEnvironment**](#createenvironment) | **POST** /environment/{code} | Create a new environment|
|[**deleteEnvironment**](#deleteenvironment) | **DELETE** /environment/{code}/{id} | Delete environment|
|[**getEnvironment**](#getenvironment) | **GET** /environment/{code}/{id} | Get a specific environment|
|[**getEnvironments**](#getenvironments) | **GET** /environment/{code} | Get all environments|
|[**updateEnvironment**](#updateenvironment) | **PATCH** /environment/{code}/{id} | Update environment|

# **createEnvironment**
> IdResponse createEnvironment(environmentCreate)

This method allows to create an environment in selected project. 

### Example

```typescript
import {
    EnvironmentsApi,
    Configuration,
    EnvironmentCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new EnvironmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let environmentCreate: EnvironmentCreate; //

const { status, data } = await apiInstance.createEnvironment(
    code,
    environmentCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **environmentCreate** | **EnvironmentCreate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**IdResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteEnvironment**
> IdResponse deleteEnvironment()

This method completely deletes an environment from repository. 

### Example

```typescript
import {
    EnvironmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new EnvironmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteEnvironment(
    code,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**IdResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getEnvironment**
> EnvironmentResponse getEnvironment()

This method allows to retrieve a specific environment. 

### Example

```typescript
import {
    EnvironmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new EnvironmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getEnvironment(
    code,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**EnvironmentResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | An environment. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getEnvironments**
> EnvironmentListResponse getEnvironments()

This method allows to retrieve all environments stored in selected project. 

### Example

```typescript
import {
    EnvironmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new EnvironmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let search: string; //A search string. Will return all environments with titles containing provided string.  (optional) (default to undefined)
let slug: string; //A search string.  Will return all environments with slugs equal to provided string.  (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getEnvironments(
    code,
    search,
    slug,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **search** | [**string**] | A search string. Will return all environments with titles containing provided string.  | (optional) defaults to undefined|
| **slug** | [**string**] | A search string.  Will return all environments with slugs equal to provided string.  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**EnvironmentListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all environments. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateEnvironment**
> IdResponse updateEnvironment(environmentUpdate)

This method updates an environment. 

### Example

```typescript
import {
    EnvironmentsApi,
    Configuration,
    EnvironmentUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new EnvironmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let environmentUpdate: EnvironmentUpdate; //

const { status, data } = await apiInstance.updateEnvironment(
    code,
    id,
    environmentUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **environmentUpdate** | **EnvironmentUpdate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**IdResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

