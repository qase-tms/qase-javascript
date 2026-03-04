# ProjectsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createProject**](#createproject) | **POST** /project | Create new project|
|[**deleteProject**](#deleteproject) | **DELETE** /project/{code} | Delete Project by code|
|[**getProject**](#getproject) | **GET** /project/{code} | Get Project by code|
|[**getProjects**](#getprojects) | **GET** /project | Get All Projects|
|[**grantAccessToProject**](#grantaccesstoproject) | **POST** /project/{code}/access | Grant access to project by code|
|[**revokeAccessToProject**](#revokeaccesstoproject) | **DELETE** /project/{code}/access | Revoke access to project by code|

# **createProject**
> ProjectCodeResponse createProject(projectCreate)

This method is used to create a new project through API. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    ProjectCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let projectCreate: ProjectCreate; //

const { status, data } = await apiInstance.createProject(
    projectCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectCreate** | **ProjectCreate**|  | |


### Return type

**ProjectCodeResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A result of project creation. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteProject**
> BaseResponse deleteProject()

This method allows to delete a specific project. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)

const { status, data } = await apiInstance.deleteProject(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


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
|**200** | A result of project removal. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProject**
> ProjectResponse getProject()

This method allows to retrieve a specific project. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)

const { status, data } = await apiInstance.getProject(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**ProjectResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Project. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProjects**
> ProjectListResponse getProjects()

This method allows to retrieve all projects available for your account. You can limit and offset params to paginate. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getProjects(
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**ProjectListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all projects. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **grantAccessToProject**
> BaseResponse grantAccessToProject(projectAccess)

This method allows to grant access to a specific project. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    ProjectAccess
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let projectAccess: ProjectAccess; //

const { status, data } = await apiInstance.grantAccessToProject(
    code,
    projectAccess
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectAccess** | **ProjectAccess**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


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
|**200** | Result of operation. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeAccessToProject**
> BaseResponse revokeAccessToProject(projectAccess)

This method allows to revoke access to a specific project. 

### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    ProjectAccess
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let projectAccess: ProjectAccess; //

const { status, data } = await apiInstance.revokeAccessToProject(
    code,
    projectAccess
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectAccess** | **ProjectAccess**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


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
|**200** | Result of operation. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

