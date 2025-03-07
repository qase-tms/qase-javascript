import { StepGherkinData, StepTextData } from './step-data';
import { StepExecution } from './step-execution';

import { Attachment } from './attachment';


export enum StepType {
  TEXT = 'text',
  GHERKIN = 'gherkin',
}

export class TestStepType {
  id: string;
  step_type: StepType;
  data: StepTextData | StepGherkinData;
  parent_id: string | null;
  execution: StepExecution;
  attachments: Attachment[];
  steps: TestStepType[];

  constructor(type: StepType = StepType.TEXT) {
    this.id = '';
    this.step_type = type;
    this.parent_id = null;
    this.execution = new StepExecution();
    this.attachments = [];
    this.steps = [];
    if (type === StepType.TEXT) {
      this.data = {
        action: '',
        expected_result: null,
        data: null,
      };
    } else {
      this.data = {
        keyword: '',
        name: '',
        line: 0,
      };
    }
  }
}
