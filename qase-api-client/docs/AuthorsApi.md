# AuthorsApi

All URIs are relative to *<https://api.qase.io/v1>*

The Authors API provides methods to retrieve information about authors (users) in Qase TMS.

## Methods

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAuthor**](AuthorsApi.md#getAuthor) | **GET** /author/{id} | Get a specific author
[**getAuthors**](AuthorsApi.md#getAuthors) | **GET** /author | Get all authors

## getAuthor

> AuthorResponse getAuthor(id)

Get details of a specific author by their ID.

### Example

```typescript
import { AuthorsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new AuthorsApi(configuration);

async function getAuthorDetails(authorId: number) {
    try {
        const response = await api.getAuthor(authorId);
        
        if (response.status) {
            const author = response.result;
            console.log('Author Details:', {
                id: author.id,
                name: author.name,
                email: author.email,
                role: author.role,
                status: author.status,
                lastActivity: author.last_activity
            });
            
            return author;
        }
    } catch (error) {
        if (error.response?.status === 404) {
            console.error(`Author ${authorId} not found`);
        } else if (error.response?.status === 401) {
            console.error('Invalid API token');
        } else {
            console.error('Error fetching author:', error.message);
        }
    }
}

// Usage example
getAuthorDetails(123);
```

### Parameters

Name | Type | Description | Notes
------------- | ------------- | ------------- | -------------
**id** | **number** | Author identifier | required

### Response Type

[**AuthorResponse**](AuthorResponse.md)

## getAuthors

> AuthorListResponse getAuthors(options)

Retrieve a list of all authors in the project with optional filtering.

### Example

```typescript
import { AuthorsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new AuthorsApi(configuration);

async function listAuthors(projectCode: string) {
    try {
        const response = await api.getAuthors("user@qase.io", "user", 10, 0);
        
        if (response.status) {
            console.log(`Total authors: ${response.result.total}`);
            
            // Process authors
            response.result.entities.forEach(author => {
                console.log(`${author.name} (${author.role})`);
            });
            
            // Check if there are more pages
            const hasMorePages = response.result.filtered > response.result.count;
            if (hasMorePages) {
                console.log('More authors available in next pages');
            }
        }
    } catch (error) {
        console.error('Failed to fetch authors:', error.message);
    }
}
```

### Parameters

Name | Type | Description | Notes
------------- | ------------- | ------------- | -------------
**search** | **string** | Search string to filter authors by name | optional
**type** | **string** | Filter by author type | optional
**limit** | **number** | Number of authors to return (default: 10) | optional
**offset** | **number** | Number of authors to skip (default: 0) | optional

### Response Type

[**AuthorListResponse**](AuthorListResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
