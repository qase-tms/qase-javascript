# SuitesApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createSuite**](SuitesApi.md#createSuite) | **POST** /suite/{code} | Create a new test suite |
| [**deleteSuite**](SuitesApi.md#deleteSuite) | **DELETE** /suite/{code}/{id} | Delete test suite |
| [**getSuite**](SuitesApi.md#getSuite) | **GET** /suite/{code}/{id} | Get a specific test suite |
| [**getSuites**](SuitesApi.md#getSuites) | **GET** /suite/{code} | Get all test suites |
| [**updateSuite**](SuitesApi.md#updateSuite) | **PATCH** /suite/{code}/{id} | Update test suite |

## createSuite

Create a new test suite

This method allows to create a test suite in the project.

### Example

```typescript
import { SuitesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SuitesApi(configuration);

const suite = {
    title: 'API Test Suite',
    description: 'Test suite for API testing',
    preconditions: 'API endpoints should be available',
    parent_id: 1
};

const response = await api.createSuite('PROJECT_CODE', suite);
console.log(`Created suite with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create test suite. |
| **suiteCreate** | [**SuiteCreate**](SuiteCreate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## deleteSuite

Delete test suite

This method allows to delete a test suite.

### Example

```typescript
import { SuitesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SuitesApi(configuration);

const response = await api.deleteSuite('PROJECT_CODE', 1);
console.log(`Suite deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete test suite. |
| **id** | **number** | ID of test suite. |

### Return type

[**IdResponse**](IdResponse.md)

## getSuite

Get a specific test suite

This method allows to retrieve a specific test suite.

### Example

```typescript
import { SuitesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SuitesApi(configuration);

const response = await api.getSuite('PROJECT_CODE', 1);
console.log(`Suite title: ${response.result.title}`);
console.log(`Description: ${response.result.description}`);
console.log(`Parent ID: ${response.result.parent_id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get test suite. |
| **id** | **number** | ID of test suite. |

### Return type

[**SuiteResponse**](SuiteResponse.md)

## getSuites

Get all test suites

This method allows to retrieve all test suites stored in selected project.

### Example

```typescript
import { SuitesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SuitesApi(configuration);

const response = await api.getSuites('PROJECT_CODE');
console.log(`Total suites: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(suite => {
    console.log(`Title: ${suite.title}`);
    console.log(`ID: ${suite.id}`);
    console.log(`Parent ID: ${suite.parent_id}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get test suites. |

### Return type

[**SuiteListResponse**](SuiteListResponse.md)

## updateSuite

Update test suite

This method allows to update a test suite.

### Example

```typescript
import { SuitesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SuitesApi(configuration);

const suite = {
    title: 'Updated API Test Suite',
    description: 'Updated test suite for API testing',
    preconditions: 'Updated preconditions'
};

const response = await api.updateSuite('PROJECT_CODE', 1, suite);
console.log(`Updated suite with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update test suite. |
| **id** | **number** | ID of test suite. |
| **suiteUpdate** | [**SuiteUpdate**](SuiteUpdate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

