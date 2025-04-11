# EnvironmentsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createEnvironment**](EnvironmentsApi.md#createEnvironment) | **POST** /environment/{code} | Create a new environment |
| [**deleteEnvironment**](EnvironmentsApi.md#deleteEnvironment) | **DELETE** /environment/{code}/{id} | Delete environment |
| [**getEnvironment**](EnvironmentsApi.md#getEnvironment) | **GET** /environment/{code}/{id} | Get a specific environment |
| [**getEnvironments**](EnvironmentsApi.md#getEnvironments) | **GET** /environment/{code} | Get all environments |
| [**updateEnvironment**](EnvironmentsApi.md#updateEnvironment) | **PATCH** /environment/{code}/{id} | Update environment |

## createEnvironment

Create a new environment

This method allows to create an environment in the project.

### Example

```typescript
import { EnvironmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v2"
});
configuration.apiKey = process.env.API_KEY;

const api = new EnvironmentsApi(configuration);

const environment = {
    title: 'Staging Environment',
    description: 'Staging environment for testing',
    host: 'staging.example.com',
    variables: {
        API_URL: 'https://api.staging.example.com',
        DB_HOST: 'db.staging.example.com'
    }
};

const response = await api.createEnvironment('PROJECT_CODE', environment);
console.log(`Created environment with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create environment. |
| **environmentCreate** | [**EnvironmentCreate**](EnvironmentCreate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## deleteEnvironment

Delete environment

This method allows to delete an environment.

### Example

```typescript
import { EnvironmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new EnvironmentsApi(configuration);

const response = await api.deleteEnvironment('PROJECT_CODE', 1);
console.log(`Environment deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete environment. |
| **id** | **number** | ID of environment. |

### Return type

[**IdResponse**](IdResponse.md)

## getEnvironment

Get a specific environment

This method allows to retrieve a specific environment.

### Example

```typescript
import { EnvironmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new EnvironmentsApi(configuration);

const response = await api.getEnvironment('PROJECT_CODE', 1);
console.log(`Environment title: ${response.result.title}`);
console.log(`Description: ${response.result.description}`);
console.log(`Host: ${response.result.host}`);
console.log(`Variables: ${JSON.stringify(response.result.variables)}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get environment. |
| **id** | **number** | ID of environment. |

### Return type

[**EnvironmentResponse**](EnvironmentResponse.md)

## getEnvironments

Get all environments

This method allows to retrieve all environments stored in selected project.

### Example

```typescript
import { EnvironmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new EnvironmentsApi(configuration);

const response = await api.getEnvironments('PROJECT_CODE');
console.log(`Total environments: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(environment => {
    console.log(`Title: ${environment.title}`);
    console.log(`ID: ${environment.id}`);
    console.log(`Host: ${environment.host}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get environments. |

### Return type

[**EnvironmentListResponse**](EnvironmentListResponse.md)

## updateEnvironment

Update environment

This method allows to update an environment.

### Example

```typescript
import { EnvironmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new EnvironmentsApi(configuration);

const environment = {
    title: 'Updated Staging Environment',
    description: 'Updated staging environment for testing',
    host: 'staging.updated.example.com',
    variables: {
        API_URL: 'https://api.staging.updated.example.com',
        DB_HOST: 'db.staging.updated.example.com'
    }
};

const response = await api.updateEnvironment('PROJECT_CODE', 1, environment);
console.log(`Updated environment with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update environment. |
| **id** | **number** | ID of environment. |
| **environmentUpdate** | [**EnvironmentUpdate**](EnvironmentUpdate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

