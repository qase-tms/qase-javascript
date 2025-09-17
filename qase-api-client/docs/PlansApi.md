# PlansApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPlan**](#createplan) | **POST** /plan/{code} | Create a new plan|
|[**deletePlan**](#deleteplan) | **DELETE** /plan/{code}/{id} | Delete plan|
|[**getPlan**](#getplan) | **GET** /plan/{code}/{id} | Get a specific plan|
|[**getPlans**](#getplans) | **GET** /plan/{code} | Get all plans|
|[**updatePlan**](#updateplan) | **PATCH** /plan/{code}/{id} | Update plan|

# **createPlan**
> IdResponse createPlan(planCreate)

This method allows to create a plan in selected project. 

### Example

```typescript
import {
    PlansApi,
    Configuration,
    PlanCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new PlansApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let planCreate: PlanCreate; //

const { status, data } = await apiInstance.createPlan(
    code,
    planCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **planCreate** | **PlanCreate**|  | |
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

# **deletePlan**
> IdResponse deletePlan()

This method completely deletes a plan from repository. 

### Example

```typescript
import {
    PlansApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new PlansApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deletePlan(
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

# **getPlan**
> PlanResponse getPlan()

This method allows to retrieve a specific plan. 

### Example

```typescript
import {
    PlansApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new PlansApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getPlan(
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

**PlanResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A plan. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPlans**
> PlanListResponse getPlans()

This method allows to retrieve all plans stored in selected project. 

### Example

```typescript
import {
    PlansApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new PlansApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getPlans(
    code,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**PlanListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all plans. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePlan**
> IdResponse updatePlan(planUpdate)

This method updates a plan. 

### Example

```typescript
import {
    PlansApi,
    Configuration,
    PlanUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new PlansApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let planUpdate: PlanUpdate; //

const { status, data } = await apiInstance.updatePlan(
    code,
    id,
    planUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **planUpdate** | **PlanUpdate**|  | |
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

