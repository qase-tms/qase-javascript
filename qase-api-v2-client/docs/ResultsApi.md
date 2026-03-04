# ResultsApi

All URIs are relative to *https://api.qase.io/v2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createResultV2**](#createresultv2) | **POST** /{project_code}/run/{run_id}/result | Create test run result|
|[**createResultsV2**](#createresultsv2) | **POST** /{project_code}/run/{run_id}/results | Bulk create test run result|

# **createResultV2**
> ResultCreateResponse createResultV2(resultCreate)

This method allows to create single test run result.  If there is no free space left in your team account, when attempting to upload an attachment, e.g., through reporters, you will receive an error with code 507 - Insufficient Storage. 

### Example

```typescript
import {
    ResultsApi,
    Configuration,
    ResultCreate
} from 'qase-api-v2-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let projectCode: string; // (default to undefined)
let runId: number; // (default to undefined)
let resultCreate: ResultCreate; //

const { status, data } = await apiInstance.createResultV2(
    projectCode,
    runId,
    resultCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resultCreate** | **ResultCreate**|  | |
| **projectCode** | [**string**] |  | defaults to undefined|
| **runId** | [**number**] |  | defaults to undefined|


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
|**202** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**422** | Unprocessable Entity |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createResultsV2**
> ResultCreateBulkResponse createResultsV2(createResultsRequestV2)

This method allows to create several test run results at once.  If there is no free space left in your team account, when attempting to upload an attachment, e.g., through reporters, you will receive an error with code 507 - Insufficient Storage. 

### Example

```typescript
import {
    ResultsApi,
    Configuration,
    CreateResultsRequestV2
} from 'qase-api-v2-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let projectCode: string; // (default to undefined)
let runId: number; // (default to undefined)
let createResultsRequestV2: CreateResultsRequestV2; //

const { status, data } = await apiInstance.createResultsV2(
    projectCode,
    runId,
    createResultsRequestV2
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createResultsRequestV2** | **CreateResultsRequestV2**|  | |
| **projectCode** | [**string**] |  | defaults to undefined|
| **runId** | [**number**] |  | defaults to undefined|


### Return type

**ResultCreateBulkResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**422** | Unprocessable Entity |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

