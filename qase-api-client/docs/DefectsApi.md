# DefectsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDefect**](#createdefect) | **POST** /defect/{code} | Create a new defect|
|[**deleteDefect**](#deletedefect) | **DELETE** /defect/{code}/{id} | Delete defect|
|[**getDefect**](#getdefect) | **GET** /defect/{code}/{id} | Get a specific defect|
|[**getDefects**](#getdefects) | **GET** /defect/{code} | Get all defects|
|[**resolveDefect**](#resolvedefect) | **PATCH** /defect/{code}/resolve/{id} | Resolve a specific defect|
|[**updateDefect**](#updatedefect) | **PATCH** /defect/{code}/{id} | Update defect|
|[**updateDefectStatus**](#updatedefectstatus) | **PATCH** /defect/{code}/status/{id} | Update a specific defect status|

# **createDefect**
> IdResponse createDefect(defectCreate)

This method allows to create a defect in selected project. 

### Example

```typescript
import {
    DefectsApi,
    Configuration,
    DefectCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let defectCreate: DefectCreate; //

const { status, data } = await apiInstance.createDefect(
    code,
    defectCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **defectCreate** | **DefectCreate**|  | |
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

# **deleteDefect**
> IdResponse deleteDefect()

This method completely deletes a defect from repository. 

### Example

```typescript
import {
    DefectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteDefect(
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

# **getDefect**
> DefectResponse getDefect()

This method allows to retrieve a specific defect. 

### Example

```typescript
import {
    DefectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getDefect(
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

**DefectResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A defect. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDefects**
> DefectListResponse getDefects()

This method allows to retrieve all defects stored in selected project. 

### Example

```typescript
import {
    DefectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let status: 'open' | 'resolved' | 'in_progress' | 'invalid'; // (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getDefects(
    code,
    status,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **status** | [**&#39;open&#39; | &#39;resolved&#39; | &#39;in_progress&#39; | &#39;invalid&#39;**]**Array<&#39;open&#39; &#124; &#39;resolved&#39; &#124; &#39;in_progress&#39; &#124; &#39;invalid&#39;>** |  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**DefectListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all defects. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resolveDefect**
> IdResponse resolveDefect()

This method allows to resolve a specific defect. 

### Example

```typescript
import {
    DefectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.resolveDefect(
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
|**200** | A result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDefect**
> IdResponse updateDefect(defectUpdate)

This method updates a defect. 

### Example

```typescript
import {
    DefectsApi,
    Configuration,
    DefectUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let defectUpdate: DefectUpdate; //

const { status, data } = await apiInstance.updateDefect(
    code,
    id,
    defectUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **defectUpdate** | **DefectUpdate**|  | |
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
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDefectStatus**
> BaseResponse updateDefectStatus(defectStatus)

This method allows to update a specific defect status. 

### Example

```typescript
import {
    DefectsApi,
    Configuration,
    DefectStatus
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new DefectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let defectStatus: DefectStatus; //

const { status, data } = await apiInstance.updateDefectStatus(
    code,
    id,
    defectStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **defectStatus** | **DefectStatus**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**BaseResponse**

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

