# Qase API - Runs Management

# qase.api_client_v1.RunsApi

All URIs are relative to *<https://api.qase.io/v1>*

The Runs API provides endpoints for managing test runs in Qase TMS. This includes creating, retrieving, updating, and completing test runs.

## Available Methods

Method | HTTP request | Description
------------- | ------------- | -------------
[**completeRun**](RunsApi.md#completeRun) | **PATCH** /run/{code}/{id}/complete | Complete test run
[**createRun**](RunsApi.md#createRun) | **POST** /run/{code} | Create a new test run
[**deleteRun**](RunsApi.md#deleteRun) | **DELETE** /run/{code}/{id} | Delete test run
[**getRun**](RunsApi.md#getRun) | **GET** /run/{code}/{id} | Get a specific test run
[**getRuns**](RunsApi.md#getRuns) | **GET** /run/{code} | Get all test runs
[**updateRun**](RunsApi.md#updateRun) | **PATCH** /run/{code}/{id} | Update test run

## Method Details

### completeRun

Complete test run

This method allows to complete a test run.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const response = await api.completeRun('PROJECT_CODE', 1);
console.log(`Test run completed: ${response.result}`);
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to complete test run. |
 **id** | **number** | ID of test run. |

#### Response Type

[**IdResponse**](IdResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

#### HTTP Response Details

| Status Code | Description | Response Headers |
|-------------|-------------|------------------|
| **200** | Run completed successfully | - |
| **400** | Invalid request parameters | - |
| **401** | Unauthorized - invalid API token | - |
| **403** | Forbidden - insufficient permissions | - |
| **404** | Run not found | - |
| **422** | Run cannot be completed (e.g., already completed) | - |
| **429** | Too many requests | - |

### createRun

Create a new test run

This method allows to create a test run in the project.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const run = {
    title: 'Regression Test Run',
    description: 'Full regression testing before release',
    cases: [1, 2, 3, 4, 5],
    environment_id: 1,
    milestone_id: 1,
    tags: ['regression', 'release']
};

const response = await api.createRun('PROJECT_CODE', run);
console.log(`Created test run with ID: ${response.result.id}`);
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to create test run. |
 **runCreate** | [**RunCreate**](RunCreate.md) |  |

#### Response Type

[**IdResponse**](IdResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

#### HTTP Response Details

| Status Code | Description | Response Headers |
|-------------|-------------|------------------|
| **200** | Run created successfully | - |
| **400** | Invalid request parameters | - |
| **401** | Unauthorized - invalid API token | - |
| **403** | Forbidden - insufficient permissions | - |
| **404** | Project not found | - |
| **422** | Invalid run data | - |
| **429** | Too many requests | - |

### deleteRun

Delete test run

This method allows to delete a test run.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const response = await api.deleteRun('PROJECT_CODE', 1);
console.log(`Test run deleted: ${response.result}`);
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to delete test run. |
 **id** | **number** | ID of test run. |

#### Response Type

[**IdResponse**](IdResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

#### HTTP Response Details

| Status Code | Description | Response Headers |
|-------------|-------------|------------------|
| **200** | Run deleted successfully | - |
| **400** | Invalid request parameters | - |
| **401** | Unauthorized - invalid API token | - |
| **403** | Forbidden - insufficient permissions | - |
| **404** | Run not found | - |
| **422** | Run cannot be deleted (e.g., already completed) | - |
| **429** | Too many requests | - |

### getRun

Get a specific test run

This method allows to retrieve a specific test run.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const response = await api.getRun('PROJECT_CODE', 1);
console.log(`Test run title: ${response.result.title}`);
console.log(`Description: ${response.result.description}`);
console.log(`Status: ${response.result.status}`);
console.log(`Cases: ${JSON.stringify(response.result.cases)}`);
console.log(`Environment: ${response.result.environment_id}`);
console.log(`Milestone: ${response.result.milestone_id}`);
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to get test run. |
 **id** | **number** | ID of test run. |

#### Response Type

[**RunResponse**](RunResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

### getRuns

Get all test runs

This method allows to retrieve all test runs stored in selected project.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const response = await api.getRuns('PROJECT_CODE');
console.log(`Total test runs: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(run => {
    console.log(`Title: ${run.title}`);
    console.log(`ID: ${run.id}`);
    console.log(`Status: ${run.status}`);
    console.log(`Cases count: ${run.cases_count}`);
    console.log('---');
});
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to get test runs. |

#### Response Type

[**RunListResponse**](RunListResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

### updateRun

Update test run

This method allows to update a test run.

#### Example

```typescript
import { RunsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new RunsApi(configuration);

const run = {
    title: 'Updated Regression Test Run',
    description: 'Updated full regression testing before release',
    cases: [1, 2, 3, 4, 5, 6, 7],
    environment_id: 2,
    milestone_id: 2,
    tags: ['regression', 'release', 'critical']
};

const response = await api.updateRun('PROJECT_CODE', 1, run);
console.log(`Updated test run with ID: ${response.result.id}`);
```

#### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **string** | Code of project, where to update test run. |
 **id** | **number** | ID of test run. |
 **runUpdate** | [**RunUpdate**](RunUpdate.md) |  |

#### Response Type

[**IdResponse**](IdResponse.md)

#### Authorization

[TokenAuth](../README.md#TokenAuth)

## Related Documentation

- [Run Model](Run.md)
- [RunCreate Model](RunCreate.md)
- [RunResponse Model](RunResponse.md)
- [RunListResponse Model](RunListResponse.md)
- [BaseResponse Model](BaseResponse.md)
- [IdResponse Model](IdResponse.md)

## Notes

- All timestamps should be provided in ISO 8601 format
- Rate limiting applies to all endpoints (429 response if exceeded)
- Test runs can be created from test cases or test plans
- Run status changes automatically based on test results
- Public access can be enabled/disabled for sharing run results externally
