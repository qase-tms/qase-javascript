# ResultCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**execution** | [**ResultExecution**](ResultExecution.md) |  | [default to undefined]
**id** | **string** | If passed, used as an idempotency key | [optional] [default to undefined]
**signature** | **string** |  | [optional] [default to undefined]
**testops_id** | **number** | ID of the test case. Cannot be specified together with testopd_ids. | [optional] [default to undefined]
**testops_ids** | **Array&lt;number&gt;** | IDs of the test cases. Cannot be specified together with testopd_id. | [optional] [default to undefined]
**fields** | [**ResultCreateFields**](ResultCreateFields.md) |  | [optional] [default to undefined]
**attachments** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**steps** | [**Array&lt;ResultStep&gt;**](ResultStep.md) |  | [optional] [default to undefined]
**steps_type** | [**ResultStepsType**](ResultStepsType.md) |  | [optional] [default to undefined]
**params** | **{ [key: string]: string; }** |  | [optional] [default to undefined]
**param_groups** | **Array&lt;Array&lt;string&gt;&gt;** | List parameter groups by name only. Add their values in the \&#39;params\&#39; field | [optional] [default to undefined]
**relations** | [**ResultRelations**](ResultRelations.md) |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]
**defect** | **boolean** | If true and the result is failed, the defect associated with the result will be created | [optional] [default to undefined]

## Example

```typescript
import { ResultCreate } from 'qase-api-v2-client';

const instance: ResultCreate = {
    title,
    execution,
    id,
    signature,
    testops_id,
    testops_ids,
    fields,
    attachments,
    steps,
    steps_type,
    params,
    param_groups,
    relations,
    message,
    defect,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
