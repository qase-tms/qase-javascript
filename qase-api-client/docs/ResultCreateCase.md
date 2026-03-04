# ResultCreateCase

Could be used instead of `case_id`.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**suite_title** | **string** | Nested suites should be separated with &#x60;TAB&#x60; symbol. | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**preconditions** | **string** |  | [optional] [default to undefined]
**postconditions** | **string** |  | [optional] [default to undefined]
**layer** | **string** | Slug of the layer. You can get it in the System Field settings. | [optional] [default to undefined]
**severity** | **string** | Slug of the severity. You can get it in the System Field settings. | [optional] [default to undefined]
**priority** | **string** | Slug of the priority. You can get it in the System Field settings. | [optional] [default to undefined]

## Example

```typescript
import { ResultCreateCase } from 'qase-api-client';

const instance: ResultCreateCase = {
    title,
    suite_title,
    description,
    preconditions,
    postconditions,
    layer,
    severity,
    priority,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
