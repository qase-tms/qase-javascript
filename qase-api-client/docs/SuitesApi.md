# SuitesApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSuite**](#createsuite) | **POST** /suite/{code} | Create a new test suite|
|[**deleteSuite**](#deletesuite) | **DELETE** /suite/{code}/{id} | Delete test suite|
|[**getSuite**](#getsuite) | **GET** /suite/{code}/{id} | Get a specific test suite|
|[**getSuites**](#getsuites) | **GET** /suite/{code} | Get all test suites|
|[**updateSuite**](#updatesuite) | **PATCH** /suite/{code}/{id} | Update test suite|

# **createSuite**
> IdResponse createSuite(suiteCreate)

This method is used to create a new test suite through API. 

### Example

```typescript
import {
    SuitesApi,
    Configuration,
    SuiteCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SuitesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let suiteCreate: SuiteCreate; //

const { status, data } = await apiInstance.createSuite(
    code,
    suiteCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **suiteCreate** | **SuiteCreate**|  | |
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

# **deleteSuite**
> IdResponse deleteSuite()

This method completely deletes a test suite with test cases from repository. 

### Example

```typescript
import {
    SuitesApi,
    Configuration,
    SuiteDelete
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SuitesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let suiteDelete: SuiteDelete; // (optional)

const { status, data } = await apiInstance.deleteSuite(
    code,
    id,
    suiteDelete
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **suiteDelete** | **SuiteDelete**|  | |
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
|**200** | A result of operation. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSuite**
> SuiteResponse getSuite()

This method allows to retrieve a specific test suite. 

### Example

```typescript
import {
    SuitesApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SuitesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getSuite(
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

**SuiteResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Test Case. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSuites**
> SuiteListResponse getSuites()

This method allows to retrieve all test suites stored in selected project. 

### Example

```typescript
import {
    SuitesApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SuitesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let search: string; //Provide a string that will be used to search by name. (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getSuites(
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

**SuiteListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all suites of project. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSuite**
> IdResponse updateSuite(suiteUpdate)

This method is used to update a test suite through API. 

### Example

```typescript
import {
    SuitesApi,
    Configuration,
    SuiteUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SuitesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let suiteUpdate: SuiteUpdate; //

const { status, data } = await apiInstance.updateSuite(
    code,
    id,
    suiteUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **suiteUpdate** | **SuiteUpdate**|  | |
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
|**200** | A result of operation. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

