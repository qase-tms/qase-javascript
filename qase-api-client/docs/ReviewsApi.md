# ReviewsApi

All URIs are relative to *https://api.qase.io/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bulkCreateReviews**](#bulkcreatereviews) | **POST** /review/{code}/bulk | Create reviews in bulk|
|[**createReview**](#createreview) | **POST** /review/{code} | Create a new review|
|[**deleteReview**](#deletereview) | **DELETE** /review/{code}/{id} | Delete review|
|[**getReview**](#getreview) | **GET** /review/{code}/{id} | Get a specific review|
|[**getReviews**](#getreviews) | **GET** /review/{code} | Get all reviews|
|[**updateReview**](#updatereview) | **PATCH** /review/{code}/{id} | Update review|

# **bulkCreateReviews**
> ReviewBulkResponse bulkCreateReviews(reviewBulk)

This method allows to submit multiple test cases for review in one request.  Returns an error if test case review is disabled in the project settings. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration,
    ReviewBulk
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let reviewBulk: ReviewBulk; //

const { status, data } = await apiInstance.bulkCreateReviews(
    code,
    reviewBulk
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewBulk** | **ReviewBulk**|  | |
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|


### Return type

**ReviewBulkResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Per-item outcomes for the submitted reviews. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createReview**
> IdResponse createReview(reviewCreate)

This method allows to submit a test case for review in selected project.  Returns an error if test case review is disabled in the project settings. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration,
    ReviewCreate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let reviewCreate: ReviewCreate; //

const { status, data } = await apiInstance.createReview(
    code,
    reviewCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewCreate** | **ReviewCreate**|  | |
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
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteReview**
> IdResponse deleteReview()

This method allows to delete a review. Merged reviews cannot be deleted.  Returns an error if test case review is disabled in the project settings. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.deleteReview(
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
|**200** | A result. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReview**
> ReviewResponse getReview()

This method allows to retrieve a specific review, including its current approval status per reviewer. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)

const { status, data } = await apiInstance.getReview(
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

**ReviewResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Review. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReviews**
> ReviewListResponse getReviews()

This method allows to retrieve all test case reviews stored in selected project. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let status: 'open' | 'merged' | 'declined'; // (optional) (default to undefined)
let type: 'create' | 'edit'; // (optional) (default to undefined)
let caseId: number; //Filter reviews by the reviewed test case ID. (optional) (default to undefined)
let authorUuid: string; //Filter reviews by the author who created them (author UUID). (optional) (default to undefined)
let reviewerUuid: string; //Filter reviews by an assigned reviewer (author UUID). (optional) (default to undefined)
let search: string; //Provide a string that will be used to search by review title. (optional) (default to undefined)
let limit: number; //A number of entities in result set. (optional) (default to 10)
let offset: number; //How many entities should be skipped. (optional) (default to 0)

const { status, data } = await apiInstance.getReviews(
    code,
    status,
    type,
    caseId,
    authorUuid,
    reviewerUuid,
    search,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Code of project, where to search entities. | defaults to undefined|
| **status** | [**&#39;open&#39; | &#39;merged&#39; | &#39;declined&#39;**]**Array<&#39;open&#39; &#124; &#39;merged&#39; &#124; &#39;declined&#39;>** |  | (optional) defaults to undefined|
| **type** | [**&#39;create&#39; | &#39;edit&#39;**]**Array<&#39;create&#39; &#124; &#39;edit&#39;>** |  | (optional) defaults to undefined|
| **caseId** | [**number**] | Filter reviews by the reviewed test case ID. | (optional) defaults to undefined|
| **authorUuid** | [**string**] | Filter reviews by the author who created them (author UUID). | (optional) defaults to undefined|
| **reviewerUuid** | [**string**] | Filter reviews by an assigned reviewer (author UUID). | (optional) defaults to undefined|
| **search** | [**string**] | Provide a string that will be used to search by review title. | (optional) defaults to undefined|
| **limit** | [**number**] | A number of entities in result set. | (optional) defaults to 10|
| **offset** | [**number**] | How many entities should be skipped. | (optional) defaults to 0|


### Return type

**ReviewListResponse**

### Authorization

[TokenAuth](../README.md#TokenAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of all reviews. |  -  |
|**400** | Bad Request. |  -  |
|**401** | Unauthorized. |  -  |
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateReview**
> IdResponse updateReview(reviewUpdate)

This method allows to update the assigned reviewers and/or the proposed test case payload of an open review. The reviewed test case cannot be changed.  Returns an error if test case review is disabled in the project settings, or if the review is not open. 

### Example

```typescript
import {
    ReviewsApi,
    Configuration,
    ReviewUpdate
} from 'qase-api-client';

const configuration = new Configuration();
const apiInstance = new ReviewsApi(configuration);

let code: string; //Code of project, where to search entities. (default to undefined)
let id: number; //Identifier. (default to undefined)
let reviewUpdate: ReviewUpdate; //

const { status, data } = await apiInstance.updateReview(
    code,
    id,
    reviewUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewUpdate** | **ReviewUpdate**|  | |
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
|**402** | Payment Required. |  -  |
|**403** | Forbidden. |  -  |
|**404** | Not Found. |  -  |
|**422** | Unprocessable Entity. |  -  |
|**429** | Too Many Requests. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

