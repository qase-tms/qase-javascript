import { TestStepType } from './test-step';
import { Attachment } from './attachment';
import { TestExecution } from './test-execution';

export class TestResultType {
  id: string;
  title: string;
  signature: string;
  run_id: number | null;
  testops_id: number | number[] | null;
  execution: TestExecution;
  fields: Record<string, string>;
  attachments: Attachment[];
  steps: TestStepType[];
  params: Record<string, string>;
  group_params: Record<string, string>;
  author: string | null;
  relations: Relation | null;
  muted: boolean;
  message: string | null;

  constructor(title: string) {
    this.id = '';
    this.title = title;
    this.signature = '';
    this.run_id = null;
    this.testops_id = null;
    this.execution = new TestExecution();
    this.fields = {};
    this.attachments = [];
    this.steps = [];
    this.params = {};
    this.group_params = {};
    this.author = null;
    this.relations = null;
    this.muted = false;
    this.message = null;
  }
}

export type Relation = {
  suite?: Suite
}

export type Suite = {
  data: SuiteData[]
}

export type SuiteData = {
  title: string
  public_id: number | null
}
