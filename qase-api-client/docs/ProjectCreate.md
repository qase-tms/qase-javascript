# ProjectCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | Project title. | [default to undefined]
**code** | **string** | Project code. Unique for team. Digits and special characters are not allowed. | [default to undefined]
**description** | **string** | Project description. | [optional] [default to undefined]
**access** | **string** |  | [optional] [default to undefined]
**group** | **string** | Team group hash. Required if access param is set to group. | [optional] [default to undefined]
**settings** | **{ [key: string]: any; }** | Additional project settings. | [optional] [default to undefined]

## Example

```typescript
import { ProjectCreate } from 'qase-api-client';

const instance: ProjectCreate = {
    title,
    code,
    description,
    access,
    group,
    settings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
