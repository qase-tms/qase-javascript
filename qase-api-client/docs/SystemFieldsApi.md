# SystemFieldsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getSystemFields**](#getsystemfields) | **GET** /system_field | Get all System Fields|

# **getSystemFields**
> SystemFieldListResponse getSystemFields()

This method allows to retrieve all system fields. 

### Example

```typescript
import {
    SystemFieldsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new SystemFieldsApi(configuration);

const { status, data } = await apiInstance.getSystemFields();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SystemFieldListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | System Field list. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

