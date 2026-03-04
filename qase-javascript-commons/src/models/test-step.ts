import { StepGherkinData, StepRequestData, StepTextData } from './step-data';
import { StepExecution } from './step-execution';

import { Attachment } from './attachment';


export enum StepType {
  TEXT = 'text',
  GHERKIN = 'gherkin',
  REQUEST = 'request',
}

export class TestStepType {
  id: string;
  step_type: StepType;
  data: StepTextData | StepGherkinData | StepRequestData;
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
    } else if (type === StepType.GHERKIN) {
      this.data = {
        keyword: '',
        name: '',
        line: 0,
      };
    } else {
      this.data = {
        request_method: '',
        request_url: '',
        request_headers: null,
        request_body: null,
        status_code: null,
        response_body: null,
        response_headers: null,
      };
    }
  }
}
