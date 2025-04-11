# ProjectsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createProject**](ProjectsApi.md#createProject) | **POST** /project | Create project |
| [**deleteProject**](ProjectsApi.md#deleteProject) | **DELETE** /project/{code} | Delete project |
| [**getProject**](ProjectsApi.md#getProject) | **GET** /project/{code} | Get project |
| [**getProjects**](ProjectsApi.md#getProjects) | **GET** /project | Get all projects |
| [**grantAccessToProject**](ProjectsApi.md#grantAccessToProject) | **POST** /project/{code}/access | Grant access to project |
| [**revokeAccessToProject**](ProjectsApi.md#revokeAccessToProject) | **DELETE** /project/{code}/access | Revoke access to project |

## createProject

Create project

This method allows to create a new project in Qase TMS.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Create a new project
const projectData = {
    title: 'My Project',
    code: 'MP',
    description: 'Project description',
    access: 'all',
    group: 'Development'
};

const response = await api.createProject(projectData);
console.log(`Created project with code: ${response.result.code}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **projectCreate** | [**ProjectCreate**](ProjectCreate.md) | Project data |

### Return type

[**ProjectResponse**](ProjectResponse.md)

## deleteProject

Delete project

This method allows to delete a specific project.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Delete a project
const response = await api.deleteProject('PROJECT_CODE');
if (response.status) {
    console.log('Project deleted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |

### Return type

[**Response**](Response.md)

## getProject

Get project

This method allows to retrieve a specific project.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Get project information
const project = await api.getProject('PROJECT_CODE');
console.log(`Project title: ${project.result.title}`);
console.log(`Description: ${project.result.description}`);
console.log(`Access: ${project.result.access}`);
console.log(`Group: ${project.result.group}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |

### Return type

[**ProjectResponse**](ProjectResponse.md)

## getProjects

Get all projects

This method allows to retrieve all projects.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Get all projects with filtering
const params = {
    limit: 10,
    offset: 0,
    filters: {
        access: ['all'],
        group: ['Development']
    }
};

const response = await api.getProjects(params);
console.log(`Total projects: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(project => {
    console.log(`[${project.code}] ${project.title}`);
    console.log(`Access: ${project.access}`);
    console.log(`Group: ${project.group}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **params** | [**ProjectParams**](ProjectParams.md) | Filter parameters |

### Return type

[**ProjectListResponse**](ProjectListResponse.md)

## grantAccessToProject

Grant access to project

This method allows to grant access to a specific project.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Grant access to project
const accessData = {
    user_id: 123,
    access_type: 'read'
};

const response = await api.grantAccessToProject('PROJECT_CODE', accessData);
if (response.status) {
    console.log('Access granted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **access** | [**ProjectAccess**](ProjectAccess.md) | Access data |

### Return type

[**Response**](Response.md)

## revokeAccessToProject

Revoke access to project

This method allows to revoke access to a specific project.

### Example

```typescript
import { ProjectsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new ProjectsApi(configuration);

// Revoke access from project
const accessData = {
    user_id: 123
};

const response = await api.revokeAccessToProject('PROJECT_CODE', accessData);
if (response.status) {
    console.log('Access revoked successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **access** | [**ProjectAccess**](ProjectAccess.md) | Access data |

### Return type

[**Response**](Response.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

