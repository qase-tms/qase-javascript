# ResultsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createResult**](ResultsApi.md#createResult) | **POST** /result/{code}/{run_id}/{hash} | Create result |
| [**createResultBulk**](ResultsApi.md#createResultBulk) | **POST** /result/{code}/{run_id}/bulk | Bulk create results |
| [**deleteResult**](ResultsApi.md#deleteResult) | **DELETE** /result/{code}/{run_id}/{hash} | Delete result |
| [**getResult**](ResultsApi.md#getResult) | **GET** /result/{code}/{run_id}/{hash} | Get result |
| [**getResults**](ResultsApi.md#getResults) | **GET** /result/{code}/{run_id} | Get all results |
| [**updateResult**](ResultsApi.md#updateResult) | **PATCH** /result/{code}/{run_id}/{hash} | Update result |

## createResult

Create result

This method allows to create a new test result in the run.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Create a new test result
const resultData = {
    status: 'passed',
    comment: 'Test passed successfully',
    time: 1500,
    stacktrace: null,
    attachments: []
};

const response = await api.createResult('PROJECT_CODE', 123, 'TEST_CASE_HASH', resultData);
console.log(`Created result ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **hash** | **string** | Test case hash |
| **result** | [**ResultCreate**](ResultCreate.md) | Result data |

### Return type

[**ResultResponse**](ResultResponse.md)

## createResultBulk

Bulk create results

This method allows to create multiple test results in the run.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Bulk create test results
const resultsData = {
    results: [
        {
            case_id: 1,
            status: 'passed',
            comment: 'Test passed successfully',
            time: 1500
        },
        {
            case_id: 2,
            status: 'failed',
            comment: 'Test failed due to timeout',
            time: 3000,
            stacktrace: 'Error: Timeout after 3000ms'
        }
    ]
};

const response = await api.createResultBulk('PROJECT_CODE', 123, resultsData);
console.log(`Created ${response.result.ids.length} results`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **resultBulk** | [**ResultBulk**](ResultBulk.md) | Bulk result data |

### Return type

[**ResultBulkResponse**](ResultBulkResponse.md)

## deleteResult

Delete result

This method allows to delete a specific test result.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Delete a test result
const response = await api.deleteResult('PROJECT_CODE', 123, 'TEST_CASE_HASH');
if (response.status) {
    console.log('Result deleted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **hash** | **string** | Test case hash |

### Return type

[**Response**](Response.md)

## getResult

Get result

This method allows to retrieve a specific test result.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Get test result information
const result = await api.getResult('PROJECT_CODE', 123, 'TEST_CASE_HASH');
console.log(`Result status: ${result.result.status}`);
console.log(`Comment: ${result.result.comment}`);
console.log(`Time: ${result.result.time}ms`);
console.log(`Stacktrace: ${result.result.stacktrace || 'None'}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **hash** | **string** | Test case hash |

### Return type

[**ResultResponse**](ResultResponse.md)

## getResults

Get all results

This method allows to retrieve all test results in the run.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Get all test results with filtering
const params = {
    limit: 10,
    offset: 0,
    filters: {
        status: ['passed', 'failed'],
        time: {
            from: 1000,
            to: 5000
        }
    }
};

const response = await api.getResults('PROJECT_CODE', 123, params);
console.log(`Total results: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(result => {
    console.log(`[${result.id}] Status: ${result.status}`);
    console.log(`Time: ${result.time}ms`);
    console.log(`Comment: ${result.comment}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **params** | [**ResultParams**](ResultParams.md) | Filter parameters |

### Return type

[**ResultListResponse**](ResultListResponse.md)

## updateResult

Update result

This method allows to update a specific test result.

### Example

```typescript
import { ResultsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ResultsApi(configuration);

// Update test result
const updateData = {
    status: 'failed',
    comment: 'Updated test result',
    time: 2000,
    stacktrace: 'Error: Test failed'
};

const response = await api.updateResult('PROJECT_CODE', 123, 'TEST_CASE_HASH', updateData);
if (response.status) {
    console.log('Result updated successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **run_id** | **number** | Run ID |
| **hash** | **string** | Test case hash |
| **result** | [**ResultUpdate**](ResultUpdate.md) | Result update data |

### Return type

[**ResultResponse**](ResultResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

