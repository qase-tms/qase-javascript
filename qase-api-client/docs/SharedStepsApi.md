# SharedStepsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSharedStep**](#createsharedstep) | **POST** /shared_step/{code} | Create a new shared step|
|[**deleteSharedStep**](#deletesharedstep) | **DELETE** /shared_step/{code}/{hash} | Delete shared step|
|[**getSharedStep**](#getsharedstep) | **GET** /shared_step/{code}/{hash} | Get a specific shared step|
|[**getSharedSteps**](#getsharedsteps) | **GET** /shared_step/{code} | Get all shared steps|
|[**updateSharedStep**](#updatesharedstep) | **PATCH** /shared_step/{code}/{hash} | Update shared step|

# **createSharedStep**
> HashResponse createSharedStep(sharedStepCreate)

This method allows to create a shared step in selected project. 

### Example

```typescript
import {
    SharedStepsApi,
    Configuration,
    SharedStepCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedStepsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let sharedStepCreate: SharedStepCreate; //

const { status, data } = await apiInstance.createSharedStep(
    code,
    sharedStepCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sharedStepCreate** | **SharedStepCreate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**HashResponse**

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

# **deleteSharedStep**
> HashResponse deleteSharedStep()

This method completely deletes a shared step from repository. 

### Example

```typescript
import {
    SharedStepsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedStepsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.deleteSharedStep(
    code,
    hash
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **hash** | [**string**] | Hash. | defaults to undefined|


### Return type

**HashResponse**

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

# **getSharedStep**
> SharedStepResponse getSharedStep()

This method allows to retrieve a specific shared step. 

### Example

```typescript
import {
    SharedStepsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedStepsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.getSharedStep(
    code,
    hash
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **hash** | [**string**] | Hash. | defaults to undefined|


### Return type

**SharedStepResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A shared step. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSharedSteps**
> SharedStepListResponse getSharedSteps()

This method allows to retrieve all shared steps stored in selected project. 

### Example

```typescript
import {
    SharedStepsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedStepsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let search: string; //Provide a string that will be used to search by name. (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getSharedSteps(
    code,
    search,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **search** | [**string**] | Provide a string that will be used to search by name. | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**SharedStepListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all shared steps. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSharedStep**
> HashResponse updateSharedStep(sharedStepUpdate)

This method updates a shared step. 

### Example

```typescript
import {
    SharedStepsApi,
    Configuration,
    SharedStepUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SharedStepsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let hash: string; //Hash. (default to undefined)
let sharedStepUpdate: SharedStepUpdate; //

const { status, data } = await apiInstance.updateSharedStep(
    code,
    hash,
    sharedStepUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sharedStepUpdate** | **SharedStepUpdate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **hash** | [**string**] | Hash. | defaults to undefined|


### Return type

**HashResponse**

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

