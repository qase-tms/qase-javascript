# SystemFieldsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**getSystemFields**](SystemFieldsApi.md#getSystemFields) | **GET** /system/field | Get all system fields |

## getSystemFields

Get all system fields

This method allows to retrieve all system fields.

### Example

```typescript
import { SystemFieldsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new SystemFieldsApi(configuration);

const response = await api.getSystemFields();
console.log(`Total fields: ${response.result.total}`);
console.log(`Filtered: ${response.result.filtered}`);
console.log(`Count: ${response.result.count}`);

response.result.entities.forEach(field => {
    console.log(`Title: ${field.title}`);
    console.log(`Type: ${field.type}`);
    console.log(`Entity: ${field.entity}`);
    console.log(`Options: ${field.options?.length || 0}`);
    console.log('---');
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SystemFieldListResponse**](SystemFieldListResponse.md)

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

## Notes

- System fields are predefined fields that are available in all projects
- Each system field has a specific type (e.g., string, number, select)
- Select-type fields have predefined options that can be used as values
- System fields cannot be modified or deleted

[[Back to top]](#)

