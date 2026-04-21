import { ResultCreate, ResultExecution, ResultRelations, ResultStep, ResultStepStatus } from 'qase-api-v2-client';
import {
  Attachment,
  Relation,
  StepStatusEnum,
  StepType,
  SuiteData,
  TestExecution,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from '../../models';
import { LoggerInterface } from '../../utils/logger';
import chalk from 'chalk';

const statusMap: Record<TestStatusEnum, string> = {
  [TestStatusEnum.passed]: 'passed',
  [TestStatusEnum.failed]: 'failed',
  [TestStatusEnum.skipped]: 'skipped',
  [TestStatusEnum.disabled]: 'skipped',
  [TestStatusEnum.blocked]: 'blocked',
  [TestStatusEnum.invalid]: 'invalid',
};

const stepStatusMap: Record<StepStatusEnum, ResultStepStatus> = {
  [StepStatusEnum.passed]: ResultStepStatus.PASSED,
  [StepStatusEnum.failed]: ResultStepStatus.FAILED,
  [StepStatusEnum.blocked]: ResultStepStatus.BLOCKED,
  [StepStatusEnum.skipped]: ResultStepStatus.SKIPPED,
};

export class ResultTransformer {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly rootSuite: string | undefined,
  ) {}

  async transform(
    result: TestResultType,
    attachmentUploader: (attachment: Attachment) => Promise<string>,
  ): Promise<ResultCreate> {
    const attachments = await this.uploadAttachments(result.attachments, attachmentUploader);
    if (result.preparedAttachments) {
      attachments.push(...result.preparedAttachments);
    }
    const steps = await this.transformSteps(result.steps, result.title, attachmentUploader);
    const params = this.transformParams(result.params);
    const groupParams = this.transformGroupParams(result.group_params, params);
    const relations = this.getRelation(result.relations);

    const model: ResultCreate = {
      title: result.title,
      execution: this.getExecution(result.execution),
      testops_ids: Array.isArray(result.testops_id)
        ? result.testops_id
        : result.testops_id !== null ? [result.testops_id] : null,
      attachments: attachments,
      steps: steps,
      params: params,
      param_groups: groupParams,
      relations: relations,
      message: result.message,
      fields: result.fields,
      defect: false,
      signature: result.signature,
    };

    if (result.tags && result.tags.length > 0) {
      model.fields = {
        ...model.fields,
        tags: [...new Set(result.tags)].join(','),
      };
    }

    this.logger.logDebug(`Transformed result: ${JSON.stringify(model)}`);

    return model;
  }

  async transformWithDefect(
    result: TestResultType,
    attachmentUploader: (attachment: Attachment) => Promise<string>,
    defect: boolean,
  ): Promise<ResultCreate> {
    const model = await this.transform(result, attachmentUploader);
    model.defect = defect;
    return model;
  }

  private async uploadAttachments(
    attachments: Attachment[],
    uploader: (attachment: Attachment) => Promise<string>,
  ): Promise<string[]> {
    const hashes: string[] = [];
    for (const attachment of attachments) {
      const hash = await uploader(attachment);
      if (hash) hashes.push(hash);
    }
    return hashes;
  }

  private async transformSteps(
    steps: TestStepType[],
    testTitle: string,
    attachmentUploader: (attachment: Attachment) => Promise<string>,
  ): Promise<ResultStep[]> {
    return Promise.all(
      steps.map(step => this.transformStep(step, testTitle, attachmentUploader)),
    );
  }

  private async transformStep(
    step: TestStepType,
    testTitle: string,
    attachmentUploader: (attachment: Attachment) => Promise<string>,
  ): Promise<ResultStep> {
    const attachmentHashes = await this.uploadAttachments(step.attachments, attachmentUploader);
    const resultStep = this.createBaseResultStep(attachmentHashes, step.execution.status);

    if (step.step_type === StepType.TEXT) {
      this.processTextStep(step, resultStep, testTitle);
    } else if (step.step_type === StepType.GHERKIN) {
      this.processGherkinStep(step, resultStep);
    } else if (step.step_type === StepType.REQUEST) {
      this.processRequestStep(step, resultStep);
    }

    if (step.steps.length > 0) {
      resultStep.steps = await this.transformSteps(step.steps, testTitle, attachmentUploader);
    }

    return resultStep;
  }

  private createBaseResultStep(attachmentHashes: string[], status: StepStatusEnum): ResultStep {
    return {
      data: { action: '' },
      execution: {
        status: stepStatusMap[status],
        attachments: attachmentHashes,
      },
    };
  }

  private processTextStep(step: TestStepType, resultStep: ResultStep, testTitle: string): void {
    if (!('action' in step.data) || !resultStep.data) return;

    const stepData = step.data;
    resultStep.data.action = stepData.action || 'Unnamed step';

    if (stepData.action === '') {
      this.logger.log(chalk`{magenta Test '${testTitle}' has empty action in step. The reporter will mark this step as unnamed step.}`);
    }

    if (stepData.expected_result != null) {
      resultStep.data.expected_result = stepData.expected_result;
    }

    if (stepData.data != null) {
      resultStep.data.input_data = stepData.data;
    }
  }

  private processGherkinStep(step: TestStepType, resultStep: ResultStep): void {
    if (!('keyword' in step.data) || !resultStep.data) return;
    resultStep.data.action = step.data.keyword;
  }

  private processRequestStep(step: TestStepType, resultStep: ResultStep): void {
    if (!('request_method' in step.data) || !resultStep.data) return;
    const stepData = step.data;
    resultStep.data.action = `${stepData.request_method} ${stepData.request_url}`;
  }

  private getExecution(exec: TestExecution): ResultExecution {
    return {
      status: statusMap[exec.status],
      start_time: exec.start_time,
      end_time: exec.end_time,
      duration: exec.duration,
      stacktrace: exec.stacktrace,
      thread: exec.thread,
    };
  }

  private transformParams(params: Record<string, string>): Record<string, string> {
    const transformedParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        transformedParams[key] = String(value);
      }
    }
    return transformedParams;
  }

  private transformGroupParams(
    groupParams: Record<string, string>,
    params: Record<string, string>,
  ): string[][] {
    const keys = Object.keys(groupParams);
    if (keys.length === 0) return [];

    for (const [key, value] of Object.entries(groupParams)) {
      if (value) {
        params[key] = value;
      }
    }

    return [keys];
  }

  private getRelation(relation: Relation | null): ResultRelations {
    if (!relation?.suite) {
      return this.getDefaultSuiteRelation();
    }

    const suiteData = this.buildSuiteData(relation.suite.data);
    return { suite: { data: suiteData } };
  }

  private getDefaultSuiteRelation(): ResultRelations {
    if (!this.rootSuite) return {};

    return {
      suite: {
        data: [{ public_id: null, title: this.rootSuite }],
      },
    };
  }

  private buildSuiteData(suiteData: SuiteData[]): SuiteData[] {
    const result: SuiteData[] = [];

    if (this.rootSuite) {
      result.push({ public_id: null, title: this.rootSuite });
    }

    return result.concat(
      suiteData.map(data => ({ public_id: null, title: data.title })),
    );
  }
}
