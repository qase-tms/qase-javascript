# MilestonesApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**createMilestone**](MilestonesApi.md#createMilestone) | **POST** /milestone/{code} | Create milestone |
| [**deleteMilestone**](MilestonesApi.md#deleteMilestone) | **DELETE** /milestone/{code}/{id} | Delete milestone |
| [**getMilestone**](MilestonesApi.md#getMilestone) | **GET** /milestone/{code}/{id} | Get milestone |
| [**getMilestones**](MilestonesApi.md#getMilestones) | **GET** /milestone/{code} | Get all milestones |
| [**updateMilestone**](MilestonesApi.md#updateMilestone) | **PATCH** /milestone/{code}/{id} | Update milestone |

## createMilestone

Create milestone

This method allows to create a new milestone in the project.

### Example

```typescript
import { MilestonesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new MilestonesApi(configuration);

// Create a new milestone
const milestoneData = {
    title: 'Sprint 1',
    description: 'First sprint milestone',
    due_date: '2024-12-31',
    status: 'active'
};

const response = await api.createMilestone('PROJECT_CODE', milestoneData);
console.log(`Created milestone ID: ${response.result.id}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **milestone** | [**MilestoneCreate**](MilestoneCreate.md) | Milestone data |

### Return type

[**MilestoneResponse**](MilestoneResponse.md)

## deleteMilestone

Delete milestone

This method allows to delete a specific milestone.

### Example

```typescript
import { MilestonesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new MilestonesApi(configuration);

// Delete a milestone
const response = await api.deleteMilestone('PROJECT_CODE', 123);
if (response.status) {
    console.log('Milestone deleted successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Milestone ID |

### Return type

[**Response**](Response.md)

## getMilestone

Get milestone

This method allows to retrieve a specific milestone.

### Example

```typescript
import { MilestonesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new MilestonesApi(configuration);

// Get milestone information
const milestone = await api.getMilestone('PROJECT_CODE', 123);
console.log(`Milestone title: ${milestone.result.title}`);
console.log(`Description: ${milestone.result.description}`);
console.log(`Due date: ${milestone.result.due_date}`);
console.log(`Status: ${milestone.result.status}`);
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Milestone ID |

### Return type

[**MilestoneResponse**](MilestoneResponse.md)

## getMilestones

Get all milestones

This method allows to retrieve all milestones in the project.

### Example

```typescript
import { MilestonesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new MilestonesApi(configuration);

// Get all milestones with filtering
const params = {
    limit: 10,
    offset: 0,
    filters: {
        status: ['active'],
        due_date: {
            from: '2024-01-01',
            to: '2024-12-31'
        }
    }
};

const response = await api.getMilestones('PROJECT_CODE', params);
console.log(`Total milestones: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(milestone => {
    console.log(`[${milestone.id}] ${milestone.title}`);
    console.log(`Due date: ${milestone.due_date}`);
    console.log(`Status: ${milestone.status}`);
    console.log('---');
});
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **params** | [**MilestoneParams**](MilestoneParams.md) | Filter parameters |

### Return type

[**MilestoneListResponse**](MilestoneListResponse.md)

## updateMilestone

Update milestone

This method allows to update a specific milestone.

### Example

```typescript
import { MilestonesApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new MilestonesApi(configuration);

// Update milestone
const updateData = {
    title: 'Updated Milestone Title',
    description: 'Updated description',
    due_date: '2024-12-31',
    status: 'completed'
};

const response = await api.updateMilestone('PROJECT_CODE', 123, updateData);
if (response.status) {
    console.log('Milestone updated successfully');
}
```

### Parameters

| Name | Type | Description |
| ------------- | ------------- | ------------- |
| **code** | **string** | Code of project, where to search entities. |
| **id** | **number** | Milestone ID |
| **milestone** | [**MilestoneUpdate**](MilestoneUpdate.md) | Milestone update data |

### Return type

[**MilestoneResponse**](MilestoneResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

