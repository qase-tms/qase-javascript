# SharedStepsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createSharedStep**](SharedStepsApi.md#createSharedStep) | **POST** /shared_step/{code} | Create a new shared step |
| [**deleteSharedStep**](SharedStepsApi.md#deleteSharedStep) | **DELETE** /shared_step/{code}/{hash} | Delete shared step |
| [**getSharedStep**](SharedStepsApi.md#getSharedStep) | **GET** /shared_step/{code}/{hash} | Get a specific shared step |
| [**getSharedSteps**](SharedStepsApi.md#getSharedSteps) | **GET** /shared_step/{code} | Get all shared steps |
| [**updateSharedStep**](SharedStepsApi.md#updateSharedStep) | **PATCH** /shared_step/{code}/{hash} | Update shared step |

## createSharedStep

Create a new shared step

This method allows to create a shared step in the project.

### Example

```typescript
import { SharedStepsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SharedStepsApi(configuration);

const sharedStep = {
    title: 'Login to application',
    steps: [
        {
            action: 'Open browser',
            expected_result: 'Browser is opened'
        },
        {
            action: 'Navigate to login page',
            expected_result: 'Login page is displayed'
        }
    ]
};

const response = await api.createSharedStep('PROJECT_CODE', sharedStep);
console.log(`Created shared step with hash: ${response.result.hash}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create shared step. |
| **sharedStepCreate** | [**SharedStepCreate**](SharedStepCreate.md) |  |

### Return type

[**HashResponse**](HashResponse.md)

## deleteSharedStep

Delete shared step

This method allows to delete a shared step.

### Example

```typescript
import { SharedStepsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SharedStepsApi(configuration);

const response = await api.deleteSharedStep('PROJECT_CODE', 'SHARED_STEP_HASH');
console.log(`Shared step deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete shared step. |
| **hash** | **string** | Hash of shared step. |

### Return type

[**HashResponse**](HashResponse.md)

## getSharedStep

Get a specific shared step

This method allows to retrieve a specific shared step.

### Example

```typescript
import { SharedStepsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SharedStepsApi(configuration);

const response = await api.getSharedStep('PROJECT_CODE', 'SHARED_STEP_HASH');
console.log(`Shared step title: ${response.result.title}`);
console.log(`Steps count: ${response.result.steps.length}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get shared step. |
| **hash** | **string** | Hash of shared step. |

### Return type

[**SharedStepResponse**](SharedStepResponse.md)

## getSharedSteps

Get all shared steps

This method allows to retrieve all shared steps stored in selected project.

### Example

```typescript
import { SharedStepsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SharedStepsApi(configuration);

const response = await api.getSharedSteps('PROJECT_CODE');
console.log(`Total shared steps: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(sharedStep => {
    console.log(`Title: ${sharedStep.title}`);
    console.log(`Hash: ${sharedStep.hash}`);
    console.log(`Steps count: ${sharedStep.steps.length}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get shared steps. |

### Return type

[**SharedStepListResponse**](SharedStepListResponse.md)

## updateSharedStep

Update shared step

This method allows to update a shared step.

### Example

```typescript
import { SharedStepsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SharedStepsApi(configuration);

const sharedStep = {
    title: 'Updated login steps',
    steps: [
        {
            action: 'Open browser',
            expected_result: 'Browser is opened'
        },
        {
            action: 'Navigate to login page',
            expected_result: 'Login page is displayed'
        },
        {
            action: 'Enter credentials',
            expected_result: 'Credentials are entered'
        }
    ]
};

const response = await api.updateSharedStep('PROJECT_CODE', 'SHARED_STEP_HASH', sharedStep);
console.log(`Updated shared step with hash: ${response.result.hash}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update shared step. |
| **hash** | **string** | Hash of shared step. |
| **sharedStepUpdate** | [**SharedStepUpdate**](SharedStepUpdate.md) |  |

### Return type

[**HashResponse**](HashResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
