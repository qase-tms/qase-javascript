# CustomFieldsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCustomField**](#createcustomfield) | **POST** /custom_field | Create new Custom Field|
|[**deleteCustomField**](#deletecustomfield) | **DELETE** /custom_field/{id} | Delete Custom Field|
|[**getCustomField**](#getcustomfield) | **GET** /custom_field/{id} | Get Custom Field|
|[**getCustomFields**](#getcustomfields) | **GET** /custom_field | Get all Custom Fields|
|[**updateCustomField**](#updatecustomfield) | **PATCH** /custom_field/{id} | Update Custom Field|

# **createCustomField**
> IdResponse createCustomField(customFieldCreate)

This method allows to create custom field. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration,
    CustomFieldCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let customFieldCreate: CustomFieldCreate; //

const { status, data } = await apiInstance.createCustomField(
    customFieldCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customFieldCreate** | **CustomFieldCreate**|  | |


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
|**200** | Created Custom Field id. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCustomField**
> BaseResponse deleteCustomField()

This method allows to delete custom field. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteCustomField(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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
|**200** | Custom Field removal result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomField**
> CustomFieldResponse getCustomField()

This method allows to retrieve custom field. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getCustomField(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**CustomFieldResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Custom Field. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomFields**
> CustomFieldListResponse getCustomFields()

This method allows to retrieve and filter custom fields. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let entity: 'case' | 'run' | 'defect'; // (optional) (default to undefined)
let type: 'string' | 'text' | 'number' | 'checkbox' | 'selectbox' | 'radio' | 'multiselect' | 'url' | 'user' | 'datetime'; // (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getCustomFields(
    entity,
    type,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **entity** | [**&#39;case&#39; | &#39;run&#39; | &#39;defect&#39;**]**Array<&#39;case&#39; &#124; &#39;run&#39; &#124; &#39;defect&#39;>** |  | (optional) defaults to undefined|
| **type** | [**&#39;string&#39; | &#39;text&#39; | &#39;number&#39; | &#39;checkbox&#39; | &#39;selectbox&#39; | &#39;radio&#39; | &#39;multiselect&#39; | &#39;url&#39; | &#39;user&#39; | &#39;datetime&#39;**]**Array<&#39;string&#39; &#124; &#39;text&#39; &#124; &#39;number&#39; &#124; &#39;checkbox&#39; &#124; &#39;selectbox&#39; &#124; &#39;radio&#39; &#124; &#39;multiselect&#39; &#124; &#39;url&#39; &#124; &#39;user&#39; &#124; &#39;datetime&#39;>** |  | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**CustomFieldListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Custom Field list. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCustomField**
> BaseResponse updateCustomField(customFieldUpdate)

This method allows to update custom field. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration,
    CustomFieldUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let id: number; //Identifier. (default to undefined)
let customFieldUpdate: CustomFieldUpdate; //

const { status, data } = await apiInstance.updateCustomField(
    id,
    customFieldUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customFieldUpdate** | **CustomFieldUpdate**|  | |
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
|**200** | Custom Field update result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

