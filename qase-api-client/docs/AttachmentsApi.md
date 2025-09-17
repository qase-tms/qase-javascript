# AttachmentsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteAttachment**](#deleteattachment) | **DELETE** /attachment/{hash} | Remove attachment by Hash|
|[**getAttachment**](#getattachment) | **GET** /attachment/{hash} | Get attachment by Hash|
|[**getAttachments**](#getattachments) | **GET** /attachment | Get all attachments|
|[**uploadAttachment**](#uploadattachment) | **POST** /attachment/{code} | Upload attachment|

# **deleteAttachment**
> HashResponse deleteAttachment()

This method allows to remove attachment by Hash. 

### Example

```typescript
import {
    AttachmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AttachmentsApi(configuration);

let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.deleteAttachment(
    hash
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hash** | [**string**] | Hash. | defaults to undefined|


### Return type

**HashResponse**

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
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAttachment**
> AttachmentResponse getAttachment()

This method allows to retrieve attachment by Hash. 

### Example

```typescript
import {
    AttachmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AttachmentsApi(configuration);

let hash: string; //Hash. (default to undefined)

const { status, data } = await apiInstance.getAttachment(
    hash
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **hash** | [**string**] | Hash. | defaults to undefined|


### Return type

**AttachmentResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Single attachment. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAttachments**
> AttachmentListResponse getAttachments()

This method allows to retrieve attachments. 

### Example

```typescript
import {
    AttachmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AttachmentsApi(configuration);

let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getAttachments(
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

**AttachmentListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all attachments. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**413** | Payload Too Large. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadAttachment**
> AttachmentUploadsResponse uploadAttachment()

This method allows to upload attachment to Qase. Max upload size: * Up to 32 Mb per file * Up to 128 Mb per single request * Up to 20 files per single request  If there is no free space left in your team account, you will receive an error with code 507 - Insufficient Storage. 

### Example

```typescript
import {
    AttachmentsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new AttachmentsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let file: Array<File>; // (optional) (default to undefined)

const { status, data } = await apiInstance.uploadAttachment(
    code,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **file** | **Array&lt;File&gt;** |  | (optional) defaults to undefined|


### Return type

**AttachmentUploadsResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | An attachments. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**413** | Payload Too Large. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

