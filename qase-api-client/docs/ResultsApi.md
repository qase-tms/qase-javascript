# ResultsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createResult**](#createresult) | **POST** /result/{code}/{id} | Create test run result|
|[**createResultBulk**](#createresultbulk) | **POST** /result/{code}/{id}/bulk | Bulk create test run result|
|[**deleteResult**](#deleteresult) | **DELETE** /result/{code}/{id}/{hash} | Delete test run result|
|[**getResult**](#getresult) | **GET** /result/{code}/{hash} | Get test run result by code|
|[**getResults**](#getresults) | **GET** /result/{code} | Get all test run results|
|[**updateResult**](#updateresult) | **PATCH** /result/{code}/{id}/{hash} | Update test run result|

# **createResult**
> ResultCreateResponse createResult(resultCreate)

This method allows to create test run result by Run Id. 

### Example

```typescript
import {
    ResultsApi,
    Configuration,
    ResultCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let resultCreate: ResultCreate; //

const { status, data } = await apiInstance.createResult(
    code,
    id,
    resultCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resultCreate** | **ResultCreate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**ResultCreateResponse**

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

# **createResultBulk**
> BaseResponse createResultBulk(resultCreateBulk)

This method allows to create a lot of test run result at once.  If you try to send more than 2,000 results in a single bulk request, you will receive an error with code 413 - Payload Too Large.  If there is no free space left in your team account, when attempting to upload an attachment, e.g., through reporters, you will receive an error with code 507 - Insufficient Storage. 

### Example

```typescript
import {
    ResultsApi,
    Configuration,
    ResultCreateBulk
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let resultCreateBulk: ResultCreateBulk; //

const { status, data } = await apiInstance.createResultBulk(
    code,
    id,
    resultCreateBulk
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resultCreateBulk** | **ResultCreateBulk**|  | |
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
|**413** | Payload Too Large. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteResult**
> HashResponse deleteResult()

This method allows to delete test run result. 

### Example

```typescript
import {
    ResultsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.deleteResult(
    code,
    id,
    hash
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|
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
|**200** | A result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResult**
> ResultResponse getResult()

This method allows to retrieve a specific test run result by Hash. 

### Example

```typescript
import {
    ResultsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.getResult(
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

**ResultResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A test run result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResults**
> ResultListResponse getResults()

This method allows to retrieve all test run results stored in selected project. 

### Example

```typescript
import {
    ResultsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let status: string; //A single test run result status. Possible values: in_progress, passed, failed, blocked, skipped, invalid.  (optional) (default to undefined)
let run: string; //A list of run IDs separated by comma. (optional) (default to undefined)
let caseId: string; //A list of case IDs separated by comma. (optional) (default to undefined)
let member: string; //A list of member IDs separated by comma. (optional) (default to undefined)
let api: boolean; // (optional) (default to undefined)
let fromEndTime: string; //Will return all results created after provided datetime. Allowed format: `Y-m-d H:i:s`.  (optional) (default to undefined)
let toEndTime: string; //Will return all results created before provided datetime. Allowed format: `Y-m-d H:i:s`.  (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getResults(
    code,
    status,
    run,
    caseId,
    member,
    api,
    fromEndTime,
    toEndTime,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **status** | [**string**] | A single test run result status. Possible values: in_progress, passed, failed, blocked, skipped, invalid.  | (optional) defaults to undefined|
| **run** | [**string**] | A list of run IDs separated by comma. | (optional) defaults to undefined|
| **caseId** | [**string**] | A list of case IDs separated by comma. | (optional) defaults to undefined|
| **member** | [**string**] | A list of member IDs separated by comma. | (optional) defaults to undefined|
| **api** | [**boolean**] |  | (optional) defaults to undefined|
| **fromEndTime** | [**string**] | Will return all results created after provided datetime. Allowed format: &#x60;Y-m-d H:i:s&#x60;.  | (optional) defaults to undefined|
| **toEndTime** | [**string**] | Will return all results created before provided datetime. Allowed format: &#x60;Y-m-d H:i:s&#x60;.  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**ResultListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all test run results. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateResult**
> HashResponse updateResult(resultUpdate)

This method allows to update test run result. 

### Example

```typescript
import {
    ResultsApi,
    Configuration,
    ResultUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let hash: string; //Hash. (default to undefined)
let resultUpdate: ResultUpdate; //

const { status, data } = await apiInstance.updateResult(
    code,
    id,
    hash,
    resultUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resultUpdate** | **ResultUpdate**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|
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
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

