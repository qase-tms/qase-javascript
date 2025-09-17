# UsersApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getUser**](#getuser) | **GET** /user/{id} | Get a specific user.|
|[**getUsers**](#getusers) | **GET** /user | Get all users.|

# **getUser**
> UserResponse getUser()

This method allows to retrieve a specific user. 

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getUser(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Identifier. | defaults to undefined|


### Return type

**UserResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A user. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsers**
> UserListResponse getUsers()

This method allows to retrieve all users. 

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getUsers(
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

**UserListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all users. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

