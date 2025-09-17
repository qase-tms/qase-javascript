# RunStats


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** |  | [optional] [default to undefined]
**statuses** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**untested** | **number** |  | [optional] [default to undefined]
**passed** | **number** |  | [optional] [default to undefined]
**failed** | **number** |  | [optional] [default to undefined]
**blocked** | **number** |  | [optional] [default to undefined]
**skipped** | **number** |  | [optional] [default to undefined]
**retest** | **number** |  | [optional] [default to undefined]
**in_progress** | **number** |  | [optional] [default to undefined]
**invalid** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { RunStats } from 'qase-api-client';

const instance: RunStats = {
    total,
    statuses,
    untested,
    passed,
    failed,
    blocked,
    skipped,
    retest,
    in_progress,
    invalid,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
