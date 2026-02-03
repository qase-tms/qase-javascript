import { TestStepType } from './test-step';
import { Attachment } from './attachment';
import { TestExecution } from './test-execution';

/**
 * Project code to test case IDs mapping for multi-project support.
 * Key: project code (string), Value: array of test case IDs (numbers).
 */
export type TestopsProjectMapping = Record<string, number[]>;

export class TestResultType {
  id: string;
  title: string;
  signature: string;
  run_id: number | null;
  testops_id: number | number[] | null;
  /**
   * Multi-project mapping: project code -> array of test case IDs.
   * When set, overrides testops_id for multi-project mode.
   * If empty/null, fall back to testops_id for single project.
   */
  testops_project_mapping: TestopsProjectMapping | null;
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
  preparedAttachments?: string[];

  constructor(title: string) {
    this.id = '';
    this.title = title;
    this.signature = '';
    this.run_id = null;
    this.testops_id = null;
    this.testops_project_mapping = null;
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
    this.preparedAttachments = [];
  }

  /**
   * Set test case IDs for a specific project in multi-project mapping.
   */
  setTestopsProjectMapping(projectCode: string, testopsIds: number[]): void {
    if (!this.testops_project_mapping) {
      this.testops_project_mapping = {};
    }
    this.testops_project_mapping[projectCode] = testopsIds;
  }

  /**
   * Get the entire project-to-IDs mapping.
   */
  getTestopsProjectMapping(): TestopsProjectMapping | null {
    return this.testops_project_mapping;
  }

  /**
   * Get test case IDs for a specific project.
   */
  getTestopsIdsForProject(projectCode: string): number[] | undefined {
    return this.testops_project_mapping?.[projectCode];
  }

  /**
   * Get list of all project codes in the mapping.
   */
  getProjects(): string[] {
    return this.testops_project_mapping ? Object.keys(this.testops_project_mapping) : [];
  }
}

export interface Relation {
  suite?: Suite
}

export interface Suite {
  data: SuiteData[]
}

export interface SuiteData {
  title: string
  public_id: number | null
}
