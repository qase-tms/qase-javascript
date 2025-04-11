# CasesApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createCase**](CasesApi.md#createCase) | **POST** /case/{code} | Create test case |
| [**deleteCase**](CasesApi.md#deleteCase) | **DELETE** /case/{code}/{id} | Delete test case |
| [**getCase**](CasesApi.md#getCase) | **GET** /case/{code}/{id} | Get test case |
| [**getCases**](CasesApi.md#getCases) | **GET** /case/{code} | Get all test cases |
| [**updateCase**](CasesApi.md#updateCase) | **PATCH** /case/{code}/{id} | Update test case |

## createCase

Create test case

This method allows to create a new test case in the project.

### Example

```typescript
import { CasesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CasesApi(configuration);

// Create a new test case
const testCase = {
    title: 'New API Test Case',
    description: 'Testing API functionality',
    priority: 2,
    severity: 3,
    suite_id: 1,
    steps: [
        {
            title: 'Step 1',
            description: 'First step description',
            expected_result: 'Expected result'
        }
    ]
};

const response = await api.createCase('PROJECT_CODE', testCase);
console.log(`Created test case ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **testCase** | [**TestCaseCreate**](TestCaseCreate.md) | Test case data |

### Return type

[**TestCaseResponse**](TestCaseResponse.md)

## deleteCase

Delete test case

This method allows to delete a specific test case.

### Example

```typescript
import { CasesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CasesApi(configuration);

// Delete a test case
const response = await api.deleteCase('PROJECT_CODE', 123);
if (response.status) {
    console.log('Test case deleted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Test case ID |

### Return type

[**Response**](Response.md)

## getCase

Get test case

This method allows to retrieve a specific test case.

### Example

```typescript
import { CasesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CasesApi(configuration);

// Get test case information
const testCase = await api.getCase('PROJECT_CODE', 123);
console.log(`Test case title: ${testCase.result.title}`);
console.log(`Description: ${testCase.result.description}`);
console.log(`Priority: ${testCase.result.priority}`);
console.log(`Severity: ${testCase.result.severity}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Test case ID |

### Return type

[**TestCaseResponse**](TestCaseResponse.md)

## getCases

Get all test cases

This method allows to retrieve all test cases in the project.

### Example

```typescript
import { CasesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CasesApi(configuration);

// Get all test cases with filtering
const params = {
    limit: 10,
    offset: 0,
    filters: {
        priority: [1, 2],
        severity: [3],
        status: ['active']
    }
};

const response = await api.getCases('PROJECT_CODE', params);
console.log(`Total test cases: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(testCase => {
    console.log(`[${testCase.id}] ${testCase.title}`);
    console.log(`Priority: ${testCase.priority}`);
    console.log(`Severity: ${testCase.severity}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **params** | [**TestCaseParams**](TestCaseParams.md) | Filter parameters |

### Return type

[**TestCaseListResponse**](TestCaseListResponse.md)

## updateCase

Update test case

This method allows to update a specific test case.

### Example

```typescript
import { CasesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CasesApi(configuration);

// Update test case
const updateData = {
    title: 'Updated Test Case Title',
    description: 'Updated description',
    priority: 1,
    severity: 2,
    status: 'active'
};

const response = await api.updateCase('PROJECT_CODE', 123, updateData);
if (response.status) {
    console.log('Test case updated successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Test case ID |
| **testCase** | [**TestCaseUpdate**](TestCaseUpdate.md) | Test case update data |

### Return type

[**TestCaseResponse**](TestCaseResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
