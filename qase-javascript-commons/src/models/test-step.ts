import { StepData } from './step-data';
import { StepExecution } from './step-execution';

import { Attachment } from './attachment';



// export type TestStepType = {
//   id: string;
//   title: string;
//   status: `${StepStatusEnum}`;
//   duration?: number | undefined;
//   error?: Error | undefined;
//   steps?: TestStepType[] | undefined;
//   attachments?: string[] | undefined;
// };



export type TestStepType = {
  id: string;
  step_type: string;
  data: StepData;
  parent_id: string | null;
  execution: StepExecution;
  attachments: Attachment[];
  steps: TestStepType[];
}