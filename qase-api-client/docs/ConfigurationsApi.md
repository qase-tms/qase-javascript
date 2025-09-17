# ConfigurationsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createConfiguration**](#createconfiguration) | **POST** /configuration/{code} | Create a new configuration in a particular group.|
|[**createConfigurationGroup**](#createconfigurationgroup) | **POST** /configuration/{code}/group | Create a new configuration group.|
|[**getConfigurations**](#getconfigurations) | **GET** /configuration/{code} | Get all configuration groups with configurations.|

# **createConfiguration**
> IdResponse createConfiguration(configurationCreate)

This method allows to create a configuration in selected project. 

### Example

```typescript
import {
    ConfigurationsApi,
    Configuration,
    ConfigurationCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ConfigurationsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let configurationCreate: ConfigurationCreate; //

const { status, data } = await apiInstance.createConfiguration(
    code,
    configurationCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **configurationCreate** | **ConfigurationCreate**|  | |
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

# **createConfigurationGroup**
> IdResponse createConfigurationGroup(configurationGroupCreate)

This method allows to create a configuration group in selected project. 

### Example

```typescript
import {
    ConfigurationsApi,
    Configuration,
    ConfigurationGroupCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ConfigurationsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let configurationGroupCreate: ConfigurationGroupCreate; //

const { status, data } = await apiInstance.createConfigurationGroup(
    code,
    configurationGroupCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **configurationGroupCreate** | **ConfigurationGroupCreate**|  | |
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

# **getConfigurations**
> ConfigurationListResponse getConfigurations()

This method allows to retrieve all configurations groups with configurations 

### Example

```typescript
import {
    ConfigurationsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ConfigurationsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)

const { status, data } = await apiInstance.getConfigurations(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**ConfigurationListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all configurations. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

