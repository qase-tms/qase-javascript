# DefectsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createDefect**](DefectsApi.md#createDefect) | **POST** /defect/{code} | Create a new defect |
| [**deleteDefect**](DefectsApi.md#deleteDefect) | **DELETE** /defect/{code}/{id} | Delete defect |
| [**getDefect**](DefectsApi.md#getDefect) | **GET** /defect/{code}/{id} | Get a specific defect |
| [**getDefects**](DefectsApi.md#getDefects) | **GET** /defect/{code} | Get all defects |
| [**updateDefect**](DefectsApi.md#updateDefect) | **PATCH** /defect/{code}/{id} | Update defect |
| [**resolveDefect**](DefectsApi.md#resolveDefect) | **PATCH** /defect/{code}/{id}/resolve | Resolve defect |

## createDefect

Create a new defect

This method allows to create a defect in the project.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const defect = {
    title: 'Critical UI Bug',
    description: 'Login button is not working on mobile devices',
    severity: 'critical',
    priority: 'high',
    status: 'open',
    attachments: ['attachment1.png', 'attachment2.png']
};

const response = await api.createDefect('PROJECT_CODE', defect);
console.log(`Created defect with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to create defect. |
| **defectCreate** | [**DefectCreate**](DefectCreate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## deleteDefect

Delete defect

This method allows to delete a defect.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const response = await api.deleteDefect('PROJECT_CODE', 1);
console.log(`Defect deleted: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to delete defect. |
| **id** | **number** | ID of defect. |

### Return type

[**IdResponse**](IdResponse.md)

## getDefect

Get a specific defect

This method allows to retrieve a specific defect.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const response = await api.getDefect('PROJECT_CODE', 1);
console.log(`Defect title: ${response.result.title}`);
console.log(`Description: ${response.result.description}`);
console.log(`Severity: ${response.result.severity}`);
console.log(`Status: ${response.result.status}`);
console.log(`Attachments: ${JSON.stringify(response.result.attachments)}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get defect. |
| **id** | **number** | ID of defect. |

### Return type

[**DefectResponse**](DefectResponse.md)

## getDefects

Get all defects

This method allows to retrieve all defects stored in selected project.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const response = await api.getDefects('PROJECT_CODE');
console.log(`Total defects: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(defect => {
    console.log(`Title: ${defect.title}`);
    console.log(`ID: ${defect.id}`);
    console.log(`Status: ${defect.status}`);
    console.log(`Severity: ${defect.severity}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to get defects. |

### Return type

[**DefectListResponse**](DefectListResponse.md)

## updateDefect

Update defect

This method allows to update a defect.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const defect = {
    title: 'Updated Critical UI Bug',
    description: 'Login button is not working on mobile devices - updated description',
    severity: 'blocker',
    priority: 'highest',
    status: 'in_progress',
    attachments: ['attachment1.png', 'attachment2.png', 'attachment3.png']
};

const response = await api.updateDefect('PROJECT_CODE', 1, defect);
console.log(`Updated defect with ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to update defect. |
| **id** | **number** | ID of defect. |
| **defectUpdate** | [**DefectUpdate**](DefectUpdate.md) |  |

### Return type

[**IdResponse**](IdResponse.md)

## resolveDefect

Resolve defect

This method allows to resolve a defect.

### Example

```typescript
import { DefectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new DefectsApi(configuration);

const response = await api.resolveDefect('PROJECT_CODE', 1);
console.log(`Defect resolved: ${response.result}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to resolve defect. |
| **id** | **number** | ID of defect. |

### Return type

[**IdResponse**](IdResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
