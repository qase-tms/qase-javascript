# RunsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**completeRun**](#completerun) | **POST** /run/{code}/{id}/complete | Complete a specific run|
|[**createRun**](#createrun) | **POST** /run/{code} | Create a new run|
|[**deleteRun**](#deleterun) | **DELETE** /run/{code}/{id} | Delete run|
|[**getRun**](#getrun) | **GET** /run/{code}/{id} | Get a specific run|
|[**getRuns**](#getruns) | **GET** /run/{code} | Get all runs|
|[**runUpdateExternalIssue**](#runupdateexternalissue) | **POST** /run/{code}/external-issue | Update external issues for runs|
|[**updateRun**](#updaterun) | **PATCH** /run/{code}/{id} | Update a specific run|
|[**updateRunPublicity**](#updaterunpublicity) | **PATCH** /run/{code}/{id}/public | Update publicity of a specific run|

# **completeRun**
> BaseResponse completeRun()

This method allows to complete a specific run. 

### Example

```typescript
import {
    RunsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.completeRun(
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

**BaseResponse**

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

# **createRun**
> IdResponse createRun(runCreate)

This method allows to create a run in selected project. 

### Example

```typescript
import {
    RunsApi,
    Configuration,
    RunCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let runCreate: RunCreate; //

const { status, data } = await apiInstance.createRun(
    code,
    runCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **runCreate** | **RunCreate**|  | |
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

# **deleteRun**
> IdResponse deleteRun()

This method completely deletes a run from repository. 

### Example

```typescript
import {
    RunsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteRun(
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

# **getRun**
> RunResponse getRun()

This method allows to retrieve a specific run. 

### Example

```typescript
import {
    RunsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let include: string; //Include a list of related entities IDs into response. Should be separated by comma. Possible values: cases, defects, external_issue  (optional) (default to undefined)

const { status, data } = await apiInstance.getRun(
    code,
    id,
    include
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|
| **include** | [**string**] | Include a list of related entities IDs into response. Should be separated by comma. Possible values: cases, defects, external_issue  | (optional) defaults to undefined|


### Return type

**RunResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A run. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRuns**
> RunListResponse getRuns()

This method allows to retrieve all runs stored in selected project. 

### Example

```typescript
import {
    RunsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let search: string; // (optional) (default to undefined)
let status: string; //A list of status values separated by comma. Possible values: in_progress, passed, failed, aborted, active (deprecated), complete (deprecated), abort (deprecated).  (optional) (default to undefined)
let milestone: number; // (optional) (default to undefined)
let environment: number; // (optional) (default to undefined)
let fromStartTime: number; // (optional) (default to undefined)
let toStartTime: number; // (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)
let include: string; //Include a list of related entities IDs into response. Should be separated by comma. Possible values: cases, defects, external_issue  (optional) (default to undefined)

const { status, data } = await apiInstance.getRuns(
    code,
    search,
    status,
    milestone,
    environment,
    fromStartTime,
    toStartTime,
    limit,
    offset,
    include
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **status** | [**string**] | A list of status values separated by comma. Possible values: in_progress, passed, failed, aborted, active (deprecated), complete (deprecated), abort (deprecated).  | (optional) defaults to undefined|
| **milestone** | [**number**] |  | (optional) defaults to undefined|
| **environment** | [**number**] |  | (optional) defaults to undefined|
| **fromStartTime** | [**number**] |  | (optional) defaults to undefined|
| **toStartTime** | [**number**] |  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|
| **include** | [**string**] | Include a list of related entities IDs into response. Should be separated by comma. Possible values: cases, defects, external_issue  | (optional) defaults to undefined|


### Return type

**RunListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all runs. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **runUpdateExternalIssue**
> runUpdateExternalIssue(runExternalIssues)

This method allows you to update links between test runs and external issues (such as Jira tickets).  You can use this endpoint to: - Link test runs to external issues by providing the external issue identifier (e.g., \"PROJ-1234\") - Update existing links by providing a new external issue identifier - Remove existing links by setting the external_issue field to null  **Important**: Each test run can have only one link with an external issue. If a test run already has an external issue link, providing a new external_issue value will replace the existing link.  The endpoint supports both Jira Cloud and Jira Server integrations. Each request can update multiple test run links in a single operation. 

### Example

```typescript
import {
    RunsApi,
    Configuration,
    RunExternalIssues
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let runExternalIssues: RunExternalIssues; //

const { status, data } = await apiInstance.runUpdateExternalIssue(
    code,
    runExternalIssues
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **runExternalIssues** | **RunExternalIssues**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


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

# **updateRun**
> BaseResponse updateRun(runupdate)

This method allows to update a specific run. 

### Example

```typescript
import {
    RunsApi,
    Configuration,
    Runupdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let runupdate: Runupdate; //

const { status, data } = await apiInstance.updateRun(
    code,
    id,
    runupdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **runupdate** | **Runupdate**|  | |
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
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateRunPublicity**
> RunPublicResponse updateRunPublicity(runPublic)

This method allows to update a publicity of specific run. 

### Example

```typescript
import {
    RunsApi,
    Configuration,
    RunPublic
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new RunsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let runPublic: RunPublic; //

const { status, data } = await apiInstance.updateRunPublicity(
    code,
    id,
    runPublic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **runPublic** | **RunPublic**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**RunPublicResponse**

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

