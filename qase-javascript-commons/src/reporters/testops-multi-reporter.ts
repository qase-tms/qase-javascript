import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

import { AbstractReporter } from './abstract-reporter';
import {
  Attachment,
  TestResultType,
  TestStatusEnum,
} from '../models';
import type { TestOpsOptionsType, TestOpsProjectConfigType, TestOpsMultiConfigType } from '../models/config/TestOpsOptionsType';
import { LoggerInterface } from '../utils/logger';
import { Mutex } from 'async-mutex';
import { ClientV2 } from '../client/clientV2';
import { HostData } from '../models/host-data';

const defaultChunkSize = 200;

/**
 * Multi-project TestOps reporter. Sends test results to multiple Qase projects
 * with different test case IDs per project. Each project gets its own run.
 */
export class TestOpsMultiReporter extends AbstractReporter {
  private readonly baseUrl: string;

  private readonly batchSize: number;

  /** Project code -> run ID */
  private readonly runIds = new Map<string, number>();

  /** Project code -> API client for that project */
  private readonly clients = new Map<string, ClientV2>();

  /** Project code -> queue of results to send */
  private readonly projectQueues = new Map<string, TestResultType[]>();

  /** Project code -> first unsent index (for batch tracking) */
  private readonly firstIndexByProject = new Map<string, number>();

  private isTestRunReady = false;

  private readonly mutex = new Mutex();

  private readonly defaultProject: string;

  private readonly projectCodes: string[];

  private readonly showPublicReportLink: boolean | undefined;

  constructor(
    logger: LoggerInterface,
    testopsOptions: TestOpsOptionsType,
    multiConfig: TestOpsMultiConfigType,
    withState: boolean,
    hostData: HostData,
    reporterName: string | undefined,
    frameworkPackage: string | undefined,
    environment?: string,
    baseUrl?: string,
    batchSize?: number,
    showPublicReportLink?: boolean,
  ) {
    super(logger);
    this.baseUrl = this.getBaseUrl(baseUrl ?? testopsOptions.api?.host);
    this.batchSize = batchSize ?? testopsOptions.batch?.size ?? defaultChunkSize;
    this.showPublicReportLink = showPublicReportLink ?? testopsOptions.showPublicReportLink;

    this.defaultProject =
      multiConfig.default_project ??
      (multiConfig.projects.length > 0 ? multiConfig.projects[0]!.code : '');

    this.projectCodes = multiConfig.projects
      .filter((p): p is TestOpsProjectConfigType => Boolean(p?.code))
      .map((p) => p.code);
    void withState; // reserved for future StateManager integration

    for (const proj of multiConfig.projects) {
      if (!proj?.code) continue;
      const projectOptions = this.buildProjectOptions(testopsOptions, proj);
      const env = proj.environment ?? environment;
      const client = new ClientV2(
        logger,
        projectOptions,
        env,
        undefined,
        hostData,
        reporterName,
        frameworkPackage,
      );
      this.clients.set(proj.code, client);
      this.projectQueues.set(proj.code, []);
      this.firstIndexByProject.set(proj.code, 0);
    }
  }

  private buildProjectOptions(
    global: TestOpsOptionsType,
    proj: TestOpsProjectConfigType,
  ): TestOpsOptionsType {
    const opts: TestOpsOptionsType = {
      project: proj.code,
      api: global.api,
      run: proj.run ?? global.run ?? {},
      plan: proj.plan ?? global.plan ?? {},
      uploadAttachments: global.uploadAttachments,
      defect: global.defect,
      configurations: global.configurations,
      statusFilter: global.statusFilter,
      showPublicReportLink: this.showPublicReportLink,
    };
    if (global.batch !== undefined) {
      opts.batch = global.batch;
    }
    return opts;
  }

  public override async startTestRun(): Promise<void> {
    await this.checkOrCreateTestRuns();
  }

  public override async addTestResult(result: TestResultType): Promise<void> {
    if (result.execution.status === TestStatusEnum.failed) {
      const mapping = result.getTestopsProjectMapping?.() ?? result.testops_project_mapping ?? null;
      if (mapping) {
        for (const [projectCode, ids] of Object.entries(mapping)) {
          for (const id of ids) {
            this.showLink(projectCode, id, result.title);
          }
        }
      } else {
        const ids = Array.isArray(result.testops_id) ? result.testops_id : [result.testops_id];
        for (const id of ids) {
          if (id != null) {
            this.showLink(this.defaultProject, id, result.title);
          }
        }
      }
    }

    const release = await this.mutex.acquire();
    try {
      // Keep original in this.results for getTestResults / fallback
      if (result.execution.stacktrace) {
        result.execution.stacktrace = this.removeAnsiEscapeCodes(result.execution.stacktrace);
      }
      if (result.message) {
        result.message = this.removeAnsiEscapeCodes(result.message);
      }
      this.results.push(result);

      if (!this.isTestRunReady) {
        return;
      }

      for (const { code, ids } of this.getProjectsToUseForResult(result)) {
        const copy = this.copyResultForProject(result, code, ids);
        const queue = this.projectQueues.get(code)!;
        queue.push(copy);

        const first = this.firstIndexByProject.get(code) ?? 0;
        if (queue.length >= first + this.batchSize) {
          await this.sendResultsForProject(code);
        }
      }
    } finally {
      release();
    }
  }

  /**
   * Get list of (projectCode, ids) for a result (multi-project mapping or legacy testops_id).
   * Caller must hold mutex when using projectQueues.
   */
  private getProjectsToUseForResult(result: TestResultType): Array<{ code: string; ids: number[] }> {
    const mapping = result.getTestopsProjectMapping?.() ?? result.testops_project_mapping ?? null;
    const projectsToUse: Array<{ code: string; ids: number[] }> = [];

    if (mapping && Object.keys(mapping).length > 0) {
      for (const [code, ids] of Object.entries(mapping)) {
        if (this.projectCodes.includes(code) && ids.length > 0) {
          projectsToUse.push({ code, ids });
        }
      }
    } else {
      // Backward compatibility: use default project + testops_id, or send without case ID to default project
      const ids = Array.isArray(result.testops_id)
        ? result.testops_id
        : result.testops_id != null
          ? [result.testops_id]
          : [];
      if (this.defaultProject) {
        projectsToUse.push({ code: this.defaultProject, ids });
      }
    }
    return projectsToUse;
  }

  /**
   * Push a result into project queues (by project / case IDs). Used by addTestResult and by
   * sendResults() when results were set via setTestResults() (e.g. Cypress hooks in another process).
   * Caller must hold mutex.
   */
  private distributeResultToProjectQueues(result: TestResultType): void {
    for (const { code, ids } of this.getProjectsToUseForResult(result)) {
      const copy = this.copyResultForProject(result, code, ids);
      const queue = this.projectQueues.get(code)!;
      queue.push(copy);
    }
  }

  private copyResultForProject(
    result: TestResultType,
    _projectCode: string,
    ids: number[],
  ): TestResultType {
    const copy = { ...result } as TestResultType;
    copy.id = uuidv4();
    copy.testops_id = ids.length === 0 ? null : ids.length === 1 ? ids[0]! : ids;
    copy.testops_project_mapping = null;
    return copy;
  }

  private async checkOrCreateTestRuns(): Promise<void> {
    for (const code of this.projectCodes) {
      const client = this.clients.get(code)!;
      const runId = await client.createRun();
      this.runIds.set(code, runId);
      this.logger.logDebug(`[${code}] Run ID: ${runId}`);
    }
    this.isTestRunReady = true;
  }

  private async sendResultsForProject(projectCode: string): Promise<boolean> {
    const queue = this.projectQueues.get(projectCode);
    const first = this.firstIndexByProject.get(projectCode) ?? 0;
    const client = this.clients.get(projectCode);
    const runId = this.runIds.get(projectCode);

    if (!queue || !client || runId === undefined) {
      return false;
    }

    const toSend = queue.slice(first, first + this.batchSize);
    if (toSend.length === 0) {
      return false;
    }

    try {
      await client.uploadResults(runId, toSend);
      this.firstIndexByProject.set(projectCode, first + toSend.length);
      this.logger.logDebug(`[${projectCode}] Sent ${toSend.length} results to Qase`);
      return true;
    } catch (error) {
      this.logger.logError(`[${projectCode}] Error sending results:`, error);
      return false;
    }
  }

  public override async sendResults(): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      // Only flush this.results when projectQueues are empty (e.g. Cypress: results set via
      // setTestResults() in another process). When addTestResult() already queued results
      // (same process, e.g. Cucumber), do not flush to avoid sending each result twice.
      const queuesEmpty = this.projectCodes.every(
        (code) => (this.projectQueues.get(code)?.length ?? 0) === 0,
      );
      if (this.results.length > 0 && this.isTestRunReady && queuesEmpty) {
        for (const result of this.results) {
          this.distributeResultToProjectQueues(result);
        }
        this.results = [];
      }

      for (const code of this.projectCodes) {
        let sent: boolean;
        do {
          sent = await this.sendResultsForProject(code);
        } while (sent);
      }
      for (const code of this.projectCodes) {
        this.projectQueues.set(code, []);
        this.firstIndexByProject.set(code, 0);
      }
    } finally {
      release();
    }
  }

  public override async publish(): Promise<void> {
    // Do not hold mutex here: sendResults() and complete() acquire it themselves.
    // Holding mutex would deadlock when sendResults() tries to acquire the same mutex.
    await this.sendResults();
    await this.complete();
  }

  public override async complete(): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      // Send any remaining results per project
      for (const code of this.projectCodes) {
        let sent: boolean;
        do {
          sent = await this.sendResultsForProject(code);
        } while (sent);
      }
      for (const code of this.projectCodes) {
        this.projectQueues.set(code, []);
        this.firstIndexByProject.set(code, 0);
      }
    } finally {
      release();
    }

    const completePromises = this.projectCodes.map(async (code) => {
      const client = this.clients.get(code);
      const runId = this.runIds.get(code);
      if (client && runId !== undefined) {
        try {
          await client.completeRun(runId);
          if (this.showPublicReportLink) {
            try {
              await client.enablePublicReport(runId);
            } catch {
              // Error already logged in enablePublicReport
            }
          }
          this.logger.log(chalk`{green [${code}] Run ${runId} completed}`);
        } catch (error) {
          this.logger.logError(`[${code}] Error completing run:`, error);
        }
      }
    });
    await Promise.all(completePromises);
  }

  public override async uploadAttachment(attachment: Attachment): Promise<string> {
    // Attachments are uploaded per project when results are sent; use default project's client
    const client = this.clients.get(this.defaultProject);
    if (client) {
      return await client.uploadAttachment(attachment);
    }
    return '';
  }

  private getBaseUrl(url: string | undefined): string {
    if (!url || url === 'qase.io') {
      return 'https://app.qase.io';
    }
    return `https://${url.replace('api', 'app')}`;
  }

  private showLink(projectCode: string, id: number | null, title: string): void {
    const runId = this.runIds.get(projectCode);
    if (runId === undefined) return;
    const baseLink = `${this.baseUrl}/run/${projectCode}/dashboard/${runId}?source=logs&search=`;
    const link = id != null ? `${baseLink}${projectCode}-${id}` : `${baseLink}${encodeURI(title)}`;
    this.logger.log(chalk`{blue See why this test failed: ${link}}`);
  }
}
