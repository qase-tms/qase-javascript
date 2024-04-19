import { StepGherkinData, StepTextData } from './step-data';
import { StepExecution } from './step-execution';

import { Attachment } from './attachment';


export enum StepType {
  TEXT = 'text',
  GHERKIN = 'gherkin',
}

export type TestStepType = {
  id: string;
  step_type: StepType;
  data: StepTextData | StepGherkinData;
  parent_id: string | null;
  execution: StepExecution;
  attachments: Attachment[];
  steps: TestStepType[];
}
