# CustomFieldsApi

All URIs are relative to *https://api.qase.io/v2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getCustomFieldV2**](#getcustomfieldv2) | **GET** /custom_field/{id} | Get Custom Field|
|[**getCustomFieldsV2**](#getcustomfieldsv2) | **GET** /custom_field | Get all Custom Fields|

# **getCustomFieldV2**
> CustomFieldResponse getCustomFieldV2()

This method allows to retrieve custom field. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration
} from 'qase-api-v2-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getCustomFieldV2(
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

# **getCustomFieldsV2**
> CustomFieldListResponse getCustomFieldsV2()

This method allows to retrieve and filter custom fields. 

### Example

```typescript
import {
    CustomFieldsApi,
    Configuration
} from 'qase-api-v2-client';

const configuration = new Configuration();
const apiInstance = new CustomFieldsApi(configuration);

let entity: 'case' | 'run' | 'defect'; // (optional) (default to undefined)
let type: 'string' | 'text' | 'number' | 'checkbox' | 'selectbox' | 'radio' | 'multiselect' | 'url' | 'user' | 'datetime'; // (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getCustomFieldsV2(
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

