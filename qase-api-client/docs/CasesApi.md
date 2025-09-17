# CasesApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bulk**](#bulk) | **POST** /case/{code}/bulk | Create test cases in bulk|
|[**caseAttachExternalIssue**](#caseattachexternalissue) | **POST** /case/{code}/external-issue/attach | Attach the external issues to the test cases|
|[**caseDetachExternalIssue**](#casedetachexternalissue) | **POST** /case/{code}/external-issue/detach | Detach the external issues from the test cases|
|[**createCase**](#createcase) | **POST** /case/{code} | Create a new test case|
|[**deleteCase**](#deletecase) | **DELETE** /case/{code}/{id} | Delete test case|
|[**getCase**](#getcase) | **GET** /case/{code}/{id} | Get a specific test case|
|[**getCases**](#getcases) | **GET** /case/{code} | Get all test cases|
|[**updateCase**](#updatecase) | **PATCH** /case/{code}/{id} | Update test case|

# **bulk**
> Bulk200Response bulk(testCasebulk)

This method allows to bulk create new test cases in a project. 

### Example

```typescript
import {
    CasesApi,
    Configuration,
    TestCasebulk
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let testCasebulk: TestCasebulk; //

const { status, data } = await apiInstance.bulk(
    code,
    testCasebulk
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **testCasebulk** | **TestCasebulk**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**Bulk200Response**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of IDs of the created cases. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **caseAttachExternalIssue**
> BaseResponse caseAttachExternalIssue(testCaseExternalIssues)


### Example

```typescript
import {
    CasesApi,
    Configuration,
    TestCaseExternalIssues
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let testCaseExternalIssues: TestCaseExternalIssues; //

const { status, data } = await apiInstance.caseAttachExternalIssue(
    code,
    testCaseExternalIssues
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **testCaseExternalIssues** | **TestCaseExternalIssues**|  | |
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
|**200** | OK. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **caseDetachExternalIssue**
> BaseResponse caseDetachExternalIssue(testCaseExternalIssues)


### Example

```typescript
import {
    CasesApi,
    Configuration,
    TestCaseExternalIssues
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let testCaseExternalIssues: TestCaseExternalIssues; //

const { status, data } = await apiInstance.caseDetachExternalIssue(
    code,
    testCaseExternalIssues
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **testCaseExternalIssues** | **TestCaseExternalIssues**|  | |
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
|**200** | OK. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCase**
> IdResponse createCase(testCaseCreate)

This method allows to create a new test case in selected project. 

### Example

```typescript
import {
    CasesApi,
    Configuration,
    TestCaseCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let testCaseCreate: TestCaseCreate; //

const { status, data } = await apiInstance.createCase(
    code,
    testCaseCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **testCaseCreate** | **TestCaseCreate**|  | |
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

# **deleteCase**
> IdResponse deleteCase()

This method completely deletes a test case from repository. 

### Example

```typescript
import {
    CasesApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteCase(
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
|**200** | A Test Case. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCase**
> TestCaseResponse getCase()

This method allows to retrieve a specific test case. 

### Example

```typescript
import {
    CasesApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let include: string; //A list of entities to include in response separated by comma. Possible values: external_issues.  (optional) (default to undefined)

const { status, data } = await apiInstance.getCase(
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
| **include** | [**string**] | A list of entities to include in response separated by comma. Possible values: external_issues.  | (optional) defaults to undefined|


### Return type

**TestCaseResponse**

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
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCases**
> TestCaseListResponse getCases()

This method allows to retrieve all test cases stored in selected project. 

### Example

```typescript
import {
    CasesApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let search: string; //Provide a string that will be used to search by name. (optional) (default to undefined)
let milestoneId: number; //ID of milestone. (optional) (default to undefined)
let suiteId: number; //ID of test suite. (optional) (default to undefined)
let severity: string; //A list of severity values separated by comma. Possible values: undefined, blocker, critical, major, normal, minor, trivial  (optional) (default to undefined)
let priority: string; //A list of priority values separated by comma. Possible values: undefined, high, medium, low  (optional) (default to undefined)
let type: string; //A list of type values separated by comma. Possible values: other, functional smoke, regression, security, usability, performance, acceptance  (optional) (default to undefined)
let behavior: string; //A list of behavior values separated by comma. Possible values: undefined, positive negative, destructive  (optional) (default to undefined)
let automation: string; //A list of values separated by comma. Possible values: is-not-automated, automated to-be-automated  (optional) (default to undefined)
let status: string; //A list of values separated by comma. Possible values: actual, draft deprecated  (optional) (default to undefined)
let externalIssuesType: 'asana' | 'azure-devops' | 'clickup-app' | 'github-app' | 'gitlab-app' | 'jira-cloud' | 'jira-server' | 'linear' | 'monday' | 'redmine-app' | 'trello-app' | 'youtrack-app'; //An integration type.  (optional) (default to undefined)
let externalIssuesIds: Array<string>; //A list of issue IDs. (optional) (default to undefined)
let include: string; //A list of entities to include in response separated by comma. Possible values: external_issues.  (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getCases(
    code,
    search,
    milestoneId,
    suiteId,
    severity,
    priority,
    type,
    behavior,
    automation,
    status,
    externalIssuesType,
    externalIssuesIds,
    include,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **search** | [**string**] | Provide a string that will be used to search by name. | (optional) defaults to undefined|
| **milestoneId** | [**number**] | ID of milestone. | (optional) defaults to undefined|
| **suiteId** | [**number**] | ID of test suite. | (optional) defaults to undefined|
| **severity** | [**string**] | A list of severity values separated by comma. Possible values: undefined, blocker, critical, major, normal, minor, trivial  | (optional) defaults to undefined|
| **priority** | [**string**] | A list of priority values separated by comma. Possible values: undefined, high, medium, low  | (optional) defaults to undefined|
| **type** | [**string**] | A list of type values separated by comma. Possible values: other, functional smoke, regression, security, usability, performance, acceptance  | (optional) defaults to undefined|
| **behavior** | [**string**] | A list of behavior values separated by comma. Possible values: undefined, positive negative, destructive  | (optional) defaults to undefined|
| **automation** | [**string**] | A list of values separated by comma. Possible values: is-not-automated, automated to-be-automated  | (optional) defaults to undefined|
| **status** | [**string**] | A list of values separated by comma. Possible values: actual, draft deprecated  | (optional) defaults to undefined|
| **externalIssuesType** | [**&#39;asana&#39; | &#39;azure-devops&#39; | &#39;clickup-app&#39; | &#39;github-app&#39; | &#39;gitlab-app&#39; | &#39;jira-cloud&#39; | &#39;jira-server&#39; | &#39;linear&#39; | &#39;monday&#39; | &#39;redmine-app&#39; | &#39;trello-app&#39; | &#39;youtrack-app&#39;**]**Array<&#39;asana&#39; &#124; &#39;azure-devops&#39; &#124; &#39;clickup-app&#39; &#124; &#39;github-app&#39; &#124; &#39;gitlab-app&#39; &#124; &#39;jira-cloud&#39; &#124; &#39;jira-server&#39; &#124; &#39;linear&#39; &#124; &#39;monday&#39; &#124; &#39;redmine-app&#39; &#124; &#39;trello-app&#39; &#124; &#39;youtrack-app&#39;>** | An integration type.  | (optional) defaults to undefined|
| **externalIssuesIds** | **Array&lt;string&gt;** | A list of issue IDs. | (optional) defaults to undefined|
| **include** | [**string**] | A list of entities to include in response separated by comma. Possible values: external_issues.  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**TestCaseListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all cases. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCase**
> IdResponse updateCase(testCaseUpdate)

This method updates a test case. 

### Example

```typescript
import {
    CasesApi,
    Configuration,
    TestCaseUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CasesApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let testCaseUpdate: TestCaseUpdate; //

const { status, data } = await apiInstance.updateCase(
    code,
    id,
    testCaseUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **testCaseUpdate** | **TestCaseUpdate**|  | |
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
|**200** | A Test Case. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

