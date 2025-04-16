# AttachmentsApi

All URIs are relative to *<https://api.qase.io/v1>*

| Method                                                     | HTTP request                         | Description       |
| ---------------------------------------------------------- | ------------------------------------ | ----------------- |
| [**getAttachments**](AttachmentsApi.md#getAttachments)     | **GET** /attachment                  | Get attachments   |
| [**uploadAttachment**](AttachmentsApi.md#uploadAttachment) | **POST** /attachment/{code}          | Upload attachment |
| [**getAttachment**](AttachmentsApi.md#getAttachment)       | **GET** /attachment/{code}/{hash}    | Get attachment    |
| [**deleteAttachment**](AttachmentsApi.md#deleteAttachment) | **DELETE** /attachment/{code}/{hash} | Delete attachment |

## getAttachments

Get attachments

This method allows to retrieve a list of attachments.

### Example

```typescript
import { AttachmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new AttachmentsApi(configuration);

// Get attachments
const response = await api.getAttachments(10, 0);
console.log(`Attachments: ${JSON.stringify(response.result)}`);
```

### Parameters

| Name       | Type       | Description                     |
| ---------- | ---------- | ------------------------------- |
| **limit**  | **number** | Number of attachments to return |
| **offset** | **number** | Number of attachments to skip   |

### Return type

[**AttachmentListResponse**](AttachmentListResponse.md)

## uploadAttachment

Upload attachment

This method allows to upload a file to Qase TMS.

### Example

```typescript
import { AttachmentsApi, Configuration } from 'qase-api-client';
import FormData from 'form-data';
import { createReadStream } from "fs";

// Initialize the API client
const configuration = new Configuration({
  basePath: "https://api.qase.io/v1",
  formDataCtor: FormData,
});
configuration.apiKey = process.env.API_KEY;

const api = new AttachmentsApi(configuration);

// Upload a content
const content = new Buffer.from('file content');
const response = await api.uploadAttachment('PROJECT_CODE', [{ name: "test.log", value: content }]);
console.log(`Uploaded file hash: ${response.data.result[0].hash}`);

// Upload a file
const filePath = "./image.png";
const fileData = createReadStream(filePath)
const fileResponse = await api.uploadAttachment('PROJECT_CODE', [{ name: "image.png", value: fileData }]);
console.log(`Uploaded file hash: ${fileResponse.data.result[0].hash}`);
```

### Parameters

| Name     | Type             | Description                                |
| -------- | ---------------- | ------------------------------------------ |
| **code** | **string**       | Code of project, where to search entities. |
| **file** | **File \| Blob** | File to upload                             |

### Return type

[**AttachmentResponse**](AttachmentResponse.md)

## getAttachment

Get attachment

This method allows to retrieve a specific attachment.

### Example

```typescript
import { AttachmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new AttachmentsApi(configuration);

// Get attachment information
const attachment = await api.getAttachment('attachment_hash');
console.log(`Attachment filename: ${attachment.result.filename}`);
console.log(`Attachment size: ${attachment.result.size} bytes`);
console.log(`Attachment URL: ${attachment.result.url}`);
```

### Parameters

| Name     | Type       | Description                                | Notes |
| -------- | ---------- | ------------------------------------------ | ----- |
| **hash** | **string** | Hash of attachment.                        |       |

### Return type

[**AttachmentResponse**](AttachmentResponse.md)

## deleteAttachment

Delete attachment

This method allows to delete a specific attachment.

### Example

```typescript
import { AttachmentsApi, Configuration } from 'qase-api-client';

const configuration = new Configuration({
    basePath: "https://api.qase.io/v1"
});
configuration.apiKey = process.env.API_KEY;

const api = new AttachmentsApi(configuration);


// Delete an attachment
const response = await api.deleteAttachment('attachment_hash');
console.log(`Deleted attachment with hash: ${response.result.hash}`);
```

### Parameters

| Name     | Type       | Description                                | Notes |
| -------- | ---------- | ------------------------------------------ | ----- |
| **hash** | **string** | Hash of attachment.                        |       |

### Return type

[**HashResponse**](HashResponse.md)

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
