# ConfigurationsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createConfiguration**](ConfigurationsApi.md#createConfiguration) | **POST** /configuration/{code} | Create configuration |
| [**deleteConfiguration**](ConfigurationsApi.md#deleteConfiguration) | **DELETE** /configuration/{code}/{id} | Delete configuration |
| [**getConfiguration**](ConfigurationsApi.md#getConfiguration) | **GET** /configuration/{code}/{id} | Get configuration |
| [**getConfigurations**](ConfigurationsApi.md#getConfigurations) | **GET** /configuration/{code} | Get all configurations |
| [**updateConfiguration**](ConfigurationsApi.md#updateConfiguration) | **PATCH** /configuration/{code}/{id} | Update configuration |

## createConfiguration

Create configuration

This method allows to create a new configuration in the project.

### Example

```typescript
import { ConfigurationsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ConfigurationsApi(configuration);

// Create a new configuration
const configData = {
    title: 'Production Environment',
    description: 'Production environment configuration',
    group: 'Environments',
    is_active: true
};

const response = await api.createConfiguration('PROJECT_CODE', configData);
console.log(`Created configuration ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **config** | [**ConfigurationCreate**](ConfigurationCreate.md) | Configuration data |

### Return type

[**ConfigurationResponse**](ConfigurationResponse.md)

## deleteConfiguration

Delete configuration

This method allows to delete a specific configuration.

### Example

```typescript
import { ConfigurationsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ConfigurationsApi(configuration);

// Delete a configuration
const response = await api.deleteConfiguration('PROJECT_CODE', 123);
if (response.status) {
    console.log('Configuration deleted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Configuration ID |

### Return type

[**Response**](Response.md)

## getConfiguration

Get configuration

This method allows to retrieve a specific configuration.

### Example

```typescript
import { ConfigurationsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ConfigurationsApi(configuration);

// Get configuration information
const config = await api.getConfiguration('PROJECT_CODE', 123);
console.log(`Configuration title: ${config.result.title}`);
console.log(`Description: ${config.result.description}`);
console.log(`Group: ${config.result.group}`);
console.log(`Active: ${config.result.is_active}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Configuration ID |

### Return type

[**ConfigurationResponse**](ConfigurationResponse.md)

## getConfigurations

Get all configurations

This method allows to retrieve all configurations in the project.

### Example

```typescript
import { ConfigurationsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ConfigurationsApi(configuration);

// Get all configurations with filtering
const params = {
    limit: 10,
    offset: 0,
    filters: {
        group: ['Environments'],
        is_active: true
    }
};

const response = await api.getConfigurations('PROJECT_CODE', params);
console.log(`Total configurations: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(config => {
    console.log(`[${config.id}] ${config.title}`);
    console.log(`Group: ${config.group}`);
    console.log(`Active: ${config.is_active}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **params** | [**ConfigurationParams**](ConfigurationParams.md) | Filter parameters |

### Return type

[**ConfigurationListResponse**](ConfigurationListResponse.md)

## updateConfiguration

Update configuration

This method allows to update a specific configuration.

### Example

```typescript
import { ConfigurationsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ConfigurationsApi(configuration);

// Update configuration
const updateData = {
    title: 'Updated Configuration Title',
    description: 'Updated description',
    group: 'Updated Group',
    is_active: false
};

const response = await api.updateConfiguration('PROJECT_CODE', 123, updateData);
if (response.status) {
    console.log('Configuration updated successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Configuration ID |
| **config** | [**ConfigurationUpdate**](ConfigurationUpdate.md) | Configuration update data |

### Return type

[**ConfigurationResponse**](ConfigurationResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

