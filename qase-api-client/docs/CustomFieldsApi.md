# CustomFieldsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createCustomField**](CustomFieldsApi.md#createCustomField) | **POST** /custom_field/{code} | Create a new custom field |
| [**deleteCustomField**](CustomFieldsApi.md#deleteCustomField) | **DELETE** /custom_field/{code}/{id} | Delete custom field |
| [**getCustomField**](CustomFieldsApi.md#getCustomField) | **GET** /custom_field/{code}/{id} | Get a specific custom field |
| [**getCustomFields**](CustomFieldsApi.md#getCustomFields) | **GET** /custom_field/{code} | Get all custom fields |
| [**updateCustomField**](CustomFieldsApi.md#updateCustomField) | **PATCH** /custom_field/{code}/{id} | Update custom field |

## createCustomField

Create a new custom field

This method allows to create a custom field in the project.

### Example

```typescript
import { CustomFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v2"
});
configuration.apiKey = process.env.API_KEY;

const api = new CustomFieldsApi(configuration);

const customField = {
    title: 'Browser Version',
    type: 'text',
    placeholder: 'Enter browser version',
    default_value: 'latest',
    is_filterable: true,
    is_visible: true,
    is_required: false,
    is_enabled_for_all_projects: false
};

const response = await api.createCustomField('PROJECT_CODE', customField);
console.log(`Created custom field with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create custom field. |
| **customFieldCreate** | [**CustomFieldCreate**](CustomFieldCreate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## deleteCustomField

Delete custom field

This method allows to delete a custom field.

### Example

```typescript
import { CustomFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v2"
});
configuration.apiKey = process.env.API_KEY;

const api = new CustomFieldsApi(configuration);

const response = await api.deleteCustomField('PROJECT_CODE', 1);
console.log(`Custom field deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete custom field. |
| **id** | **number** | ID of custom field. |

### Return type

[**IdResponse**](IdResponse.md)

## getCustomField

Get a specific custom field

This method allows to retrieve a specific custom field.

### Example

```typescript
import { CustomFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CustomFieldsApi(configuration);

const response = await api.getCustomField('PROJECT_CODE', 1);
console.log(`Custom field title: ${response.result.title}`);
console.log(`Type: ${response.result.type}`);
console.log(`Placeholder: ${response.result.placeholder}`);
console.log(`Default value: ${response.result.default_value}`);
console.log(`Is filterable: ${response.result.is_filterable}`);
console.log(`Is visible: ${response.result.is_visible}`);
console.log(`Is required: ${response.result.is_required}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get custom field. |
| **id** | **number** | ID of custom field. |

### Return type

[**CustomFieldResponse**](CustomFieldResponse.md)

## getCustomFields

Get all custom fields

This method allows to retrieve all custom fields stored in selected project.

### Example

```typescript
import { CustomFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CustomFieldsApi(configuration);

const response = await api.getCustomFields('PROJECT_CODE');
console.log(`Total custom fields: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(field => {
    console.log(`Title: ${field.title}`);
    console.log(`ID: ${field.id}`);
    console.log(`Type: ${field.type}`);
    console.log(`Is filterable: ${field.is_filterable}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get custom fields. |

### Return type

[**CustomFieldListResponse**](CustomFieldListResponse.md)

## updateCustomField

Update custom field

This method allows to update a custom field.

### Example

```typescript
import { CustomFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new CustomFieldsApi(configuration);

const customField = {
    title: 'Updated Browser Version',
    type: 'text',
    placeholder: 'Enter updated browser version',
    default_value: 'latest stable',
    is_filterable: true,
    is_visible: true,
    is_required: true,
    is_enabled_for_all_projects: true
};

const response = await api.updateCustomField('PROJECT_CODE', 1, customField);
console.log(`Updated custom field with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update custom field. |
| **id** | **number** | ID of custom field. |
| **customFieldUpdate** | [**CustomFieldUpdate**](CustomFieldUpdate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

