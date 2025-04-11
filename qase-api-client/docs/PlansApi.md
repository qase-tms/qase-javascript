# PlansApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createPlan**](PlansApi.md#createPlan) | **POST** /plan/{code} | Create a new test plan |
| [**deletePlan**](PlansApi.md#deletePlan) | **DELETE** /plan/{code}/{id} | Delete test plan |
| [**getPlan**](PlansApi.md#getPlan) | **GET** /plan/{code}/{id} | Get a specific test plan |
| [**getPlans**](PlansApi.md#getPlans) | **GET** /plan/{code} | Get all test plans |
| [**updatePlan**](PlansApi.md#updatePlan) | **PATCH** /plan/{code}/{id} | Update test plan |

## createPlan

Create a new test plan

This method allows to create a test plan in the project.

### Example

```typescript
import { PlansApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new PlansApi(configuration);

const plan = {
    title: 'API Test Plan',
    description: 'Test plan for API testing',
    cases: [1, 2, 3]
};

const response = await api.createPlan('PROJECT_CODE', plan);
console.log(`Created plan with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create test plan. |
| **planCreate** | [**PlanCreate**](PlanCreate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## deletePlan

Delete test plan

This method allows to delete a test plan.

### Example

```typescript
import { PlansApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new PlansApi(configuration);

const response = await api.deletePlan('PROJECT_CODE', 1);
console.log(`Plan deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete test plan. |
| **id** | **number** | ID of test plan. |

### Return type

[**IdResponse**](IdResponse.md)

## getPlan

Get a specific test plan

This method allows to retrieve a specific test plan.

### Example

```typescript
import { PlansApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new PlansApi(configuration);

const response = await api.getPlan('PROJECT_CODE', 1);
console.log(`Plan title: ${response.result.title}`);
console.log(`Description: ${response.result.description}`);
console.log(`Cases count: ${response.result.cases?.length || 0}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get test plan. |
| **id** | **number** | ID of test plan. |

### Return type

[**PlanResponse**](PlanResponse.md)

## getPlans

Get all test plans

This method allows to retrieve all test plans stored in selected project.

### Example

```typescript
import { PlansApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new PlansApi(configuration);

const response = await api.getPlans('PROJECT_CODE');
console.log(`Total plans: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(plan => {
    console.log(`Title: ${plan.title}`);
    console.log(`ID: ${plan.id}`);
    console.log(`Cases count: ${plan.cases?.length || 0}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get test plans. |

### Return type

[**PlanListResponse**](PlanListResponse.md)

## updatePlan

Update test plan

This method allows to update a test plan.

### Example

```typescript
import { PlansApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new PlansApi(configuration);

const plan = {
    title: 'Updated API Test Plan',
    description: 'Updated test plan for API testing',
    cases: [1, 2, 3, 4]
};

const response = await api.updatePlan('PROJECT_CODE', 1, plan);
console.log(`Updated plan with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update test plan. |
| **id** | **number** | ID of test plan. |
| **planUpdate** | [**PlanUpdate**](PlanUpdate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

