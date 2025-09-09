import WDIOReporter, {
  AfterCommandArgs,
  BeforeCommandArgs,
  RunnerStats,
  SuiteStats,
  TestStats,
  Tag,
} from '@wdio/reporter';
import {
  Attachment,
  composeOptions,
  CompoundError,
  ConfigLoader,
  generateSignature,
  getMimeTypes,
  QaseReporter,
  Relation,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
} from 'qase-javascript-commons';

import { v4 as uuidv4 } from 'uuid';
import { Storage } from './storage';
import { QaseReporterOptions } from './options';
import { isEmpty, isScreenshotCommand } from './utils';
import {
  AddAttachmentEventArgs,
  AddQaseIdEventArgs,
  AddRecordsEventArgs,
  AddSuiteEventArgs,
  AddTitleEventArgs,
} from './models';
import path from 'path';
import { events } from './events';

export default class WDIOQaseReporter extends WDIOReporter {
    /**
   * @type {RegExp}
   */
    static qaseIdRegExp = /\(Qase ID:? ([\d,]+)\)/;

  /**
   * @type {Record<string, TestStatusEnum>}
   */
  static statusMap: Record<string, TestStatusEnum> = {
    'passed': TestStatusEnum.passed,
    'failed': TestStatusEnum.failed,
    'skipped': TestStatusEnum.skipped,
    'pending': TestStatusEnum.skipped,
  };

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  private storage: Storage;

  /**
   * @type {boolean}
   * @private
   */
  private isSync: boolean;

  private _options: QaseReporterOptions;
  private _isMultiremote?: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(options);
    const configLoader = new ConfigLoader();
    const config = configLoader.load();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.reporter = QaseReporter.getInstance({
      ...composeOptions(options, config),
      frameworkPackage: '@wdio/cli',
      frameworkName: 'wdio',
      reporterName: 'wdio-qase-reporter',
    });

    this.isSync = true;
    this.storage = new Storage();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._options = Object.assign(new QaseReporterOptions(), options);

    this.registerListeners();
  }

  override get isSynchronised() {
    return this.isSync;
  }

  override set isSynchronised(value: boolean) {
    this.isSync = value;
  }

  override onRunnerStart(runner: RunnerStats) {
    this._isMultiremote = runner.isMultiremote;
    this.isSync = false;
  }

  override onSuiteStart(suite: SuiteStats) {
    this.storage.currentFile = suite.file;

    if (this._options.useCucumber && suite.type === 'scenario') {
      this._startTest(suite.title, suite.cid ?? '');

      if (suite.tags === undefined) {
        return;
      }

      const tags = (suite.tags as Tag[]).map((tag) => {
        return tag.name;
      });

      for (const tag of tags) {
        if (!tag.includes('=')) {
          continue;
        }

        const tagData = this.parseTag(tag);
        if (tagData === null) {
          continue;
        }

        switch (tagData.key.toLowerCase()) {
          case '@qaseid':
            this.addQaseId({ ids: tagData.value.split(',').map((id) => parseInt(id)) });
            break;
          case '@title':
            this.addTitle({ title: tagData.value });
            break;
          case '@suite':
            this.addSuite({ suite: tagData.value });
            break;
        }
      }

      return;
    }

    this.storage.suites.push(suite.title);
  }

  override async onSuiteEnd(suite: SuiteStats) {
    this.storage.currentFile = undefined;

    if (this._options.useCucumber && suite.type === 'scenario') {
      suite.hooks = suite.hooks.map((hook) => {
        hook.state = hook.state ?? 'passed';
        return hook;
      });

      const suiteChildren = [...suite.tests, ...suite.hooks];

      const isSkipped = suite.tests.every(item => ['skipped'].includes(item.state))
        && suite.hooks.every(item => ['passed', 'skipped'].includes(item.state ?? 'passed'));

      if (isSkipped) {
        await this._endTest(TestStatusEnum.skipped, null);
        return;
      }

      const isFailed = suiteChildren.find(item => item.state === 'failed');

      if (isFailed) {
        const err = WDIOQaseReporter.transformError(isFailed.errors ?? []);
        await this._endTest(TestStatusEnum.failed, err);
        return;
      }

      const isPassed = suiteChildren.every(item => item.state === 'passed');
      const isPartiallySkipped = suiteChildren.every(item => ['passed', 'skipped'].includes(item.state ?? 'passed'));

      if (isPassed || isPartiallySkipped) {
        await this._endTest(TestStatusEnum.passed, null);
        return;
      }

      return;
    }

    this.storage.clear();
  }

  override async onRunnerEnd() {
    await this.reporter.sendResults();
    this.isSync = true;
  }

  override onTestStart(test: TestStats) {
    if (this._options.useCucumber) {
      this._startStep(test.title);
      return;
    }

    this._startTest(test.title, test.cid, test.start.valueOf() / 1000);
  }


  /**
   * @param {Error[]} testErrors
   * @returns {CompoundError}
   * @private
   */
  private static transformError(testErrors: Error[]): CompoundError {
    const err = new CompoundError();
    for (const error of testErrors) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (error.message == undefined) {
        continue;
      }
      err.addMessage(error.message);
    }

    for (const error of testErrors) {
      if (error.stack == undefined) {
        continue;
      }
      err.addStacktrace(error.stack);
    }

    return err;
  }

  override async onTestPass() {
    if (this._options.useCucumber) {
      this._endStep();
      return;
    }

    await this._endTest(TestStatusEnum.passed, null);
  }

  override async onTestRetry(test: TestStats) {
    const error = test.errors ? WDIOQaseReporter.transformError(test.errors) : null;

    if (this._options.useCucumber) {
      this._endStep(error ? TestStatusEnum.failed : TestStatusEnum.passed);
      return;
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped,
      error,
      test.end ? test.end.valueOf() / 1000 : Date.now().valueOf() / 1000);
  }

  override async onTestFail(test: TestStats) {
    const error = test.errors ? WDIOQaseReporter.transformError(test.errors) : null;

    if (this._options.useCucumber) {
      this._endStep(TestStatusEnum.failed);
      return;
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped,
      error,
      test.end ? test.end.valueOf() / 1000 : Date.now().valueOf() / 1000);
  }

  override async onTestSkip(test: TestStats) {
    if (this._options.useCucumber) {
      this._endStep(TestStatusEnum.skipped);
      return;
    }

    if (this.storage.getCurrentTest()?.title !== test.title) {
      this._startTest(test.title, test.cid, test.start.valueOf() / 1000);
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped, null);
  }

  private async _endTest(status: TestStatusEnum, err: CompoundError | null, end_time: number = Date.now().valueOf() / 1000) {
    const testResult = this.storage.getCurrentTest();
    if (testResult === undefined || this.storage.ignore) {
      return;
    }

    if (testResult.relations === null) {
      const relations: Relation = {};
      if (this.storage.suites.length > 0) {
        relations.suite = {
          data: this.storage.suites.map((suite) => {
            return {
              title: suite,
              public_id: null,
            };
          }),
        };
      }

      testResult.relations = relations;
    }

    testResult.execution.duration = testResult.execution.start_time ? Math.round(end_time - testResult.execution.start_time) : 0;
    
    // Convert CompoundError to regular Error for status determination
    let error: Error | null = null;
    if (err) {
      error = new Error(err.message || 'Test failed');
      if (err.stacktrace) {
        error.stack = err.stacktrace;
      }
    }
    
    // Determine status based on error type
    testResult.execution.status = determineTestStatus(error, status);
    
    testResult.execution.stacktrace = err === null ?
      null : err.stacktrace === undefined ?
        null : err.stacktrace;

    testResult.message = err === null ?
      null : err.message === undefined ?
        null : err.message;

    testResult.signature = generateSignature(
      Array.isArray(testResult.testops_id) ? testResult.testops_id : testResult.testops_id ? [testResult.testops_id] : null,
      [...this.storage.suites, testResult.title],
      testResult.params
    );

    const ids = WDIOQaseReporter.extractQaseIdsFromTitle(testResult.title);
    if (ids.length > 0) {
      testResult.testops_id = ids;
    }
    testResult.title = this.removeQaseIdsFromTitle(testResult.title);

    await this.reporter.addTestResult(testResult);
  }

  override onBeforeCommand(command: BeforeCommandArgs) {
    if (!this.storage.getLastItem()) {
      return;
    }

    const { disableWebdriverStepsReporting } = this._options;

    if (disableWebdriverStepsReporting || this._isMultiremote) {
      return;
    }

    const { method, endpoint } = command;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const stepName = command.command ? command.command : `${method} ${endpoint}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = command.body || command.params;

    this._startStep(stepName);

    if (!isEmpty(payload)) {
      this.attachJSON('Request', payload);
    }
  }

  override onAfterCommand(command: AfterCommandArgs) {
    const { disableWebdriverStepsReporting, disableWebdriverScreenshotsReporting } = this._options;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const commandResult: string | undefined = command.result.value || undefined;
    const isScreenshot = isScreenshotCommand(command);
    if (!disableWebdriverScreenshotsReporting && isScreenshot && commandResult) {
      this.attachFile('Screenshot.png', Buffer.from(commandResult, 'base64'), 'image/png');
    }

    if (disableWebdriverStepsReporting || this._isMultiremote || !this.storage.getCurrentStep()) {
      return;
    }

    this.attachJSON('Response', commandResult);
    this._endStep();
  }

  registerListeners() {
    process.on(events.addQaseID, this.addQaseId.bind(this));
    process.on(events.addTitle, this.addTitle.bind(this));
    process.on(events.addFields, this.addFields.bind(this));
    process.on(events.addSuite, this.addSuite.bind(this));
    process.on(events.addParameters, this.addParameters.bind(this));
    process.on(events.addGroupParameters, this.addGroupParameters.bind(this));
    process.on(events.addAttachment, this.addAttachment.bind(this));
    process.on(events.addIgnore, this.ignore.bind(this));
    process.on(events.addStep, this.addStep.bind(this));
  }

  addQaseId({ ids }: AddQaseIdEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    curTest.testops_id = ids;
  }

  addTitle({ title }: AddTitleEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    curTest.title = title;
  }

  addSuite({ suite }: AddSuiteEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    curTest.relations = {
      suite: {
        data: [
          {
            title: suite,
            public_id: null,
          },
        ],
      },
    };
  }

  addParameters({ records }: AddRecordsEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(records)) {
      stringRecord[String(key)] = String(value);
    }

    curTest.params = stringRecord;
  }

  addGroupParameters({ records }: AddRecordsEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(records)) {
      stringRecord[String(key)] = String(value);
    }

    curTest.group_params = stringRecord;
  }

  addFields({ records }: AddRecordsEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(records)) {
      stringRecord[String(key)] = String(value);
    }

    curTest.fields = records;
  }

  addAttachment({ name, type, content, paths }: AddAttachmentEventArgs) {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    if (paths) {
      for (const file of paths) {
        const attachmentName = path.basename(file);
        const contentType: string = getMimeTypes(file);

        const attach: Attachment = {
          file_path: file,
          size: 0,
          id: uuidv4(),
          file_name: attachmentName,
          mime_type: contentType,
          content: '',
        };

        curTest.attachments.push(attach);
      }
      return;
    }

    if (content) {
      const attachmentName = name ?? 'attachment';
      const contentType = type ?? 'application/octet-stream';

      const attach: Attachment = {
        file_path: null,
        size: content.length,
        id: uuidv4(),
        file_name: attachmentName,
        mime_type: contentType,
        content: content,
      };

      curTest.attachments.push(attach);
    }
  }

  ignore() {
    const curTest = this.storage.getCurrentTest();
    if (!curTest) {
      return;
    }

    this.storage.ignore = true;
  }

  addStep(step: TestStepType) {
    const curItem = this.storage.getLastItem();
    if (!curItem) {
      return;
    }

    curItem.steps.push(step);
  }

  private _startTest(title: string, cid: string, start_time: number = Date.now().valueOf() / 1000) {
    const result = new TestResultType(title);
    result.execution.thread = cid;
    result.execution.start_time = start_time;
    result.id = uuidv4();

    this.storage.push(result);
  }

  private _startStep(title: string) {
    const step: TestStepType = {
      id: uuidv4(),
      step_type: StepType.TEXT,
      data: {
        action: title,
        expected_result: null,
        data: null,
      },
      parent_id: this.storage.getLastItem()?.id ?? null,
      execution: {
        start_time: Date.now().valueOf() / 1000,
        end_time: null,
        status: StepStatusEnum.passed,
        duration: null,
      },
      steps: [],
      attachments: [],
    };

    this.storage.getLastItem()?.steps.push(step);
    this.storage.push(step);
  }

  private attachJSON(name: string, json: unknown) {
    const isStr = typeof json === 'string';
    const content = isStr ? json : JSON.stringify(json, null, 2);

    this.attachFile(name, String(content), isStr ? 'application/json' : 'text/plain');
  }

  private attachFile(name: string, content: string | Buffer, contentType: string) {
    if (!this.storage.getLastItem()) {
      throw new Error('There isn\'t any active test!');
    }

    const attach: Attachment = {
      file_path: null,
      size: content.length,
      id: uuidv4(),
      file_name: name,
      mime_type: contentType,
      content: content,
    };

    this.storage.getLastItem()?.attachments.push(attach);
  }

  private _endStep(status: TestStatusEnum = TestStatusEnum.passed) {
    if (!this.storage.getLastItem()) {
      return;
    }

    const step = this.storage.pop();
    if (!step) {
      return;
    }

    step.execution.end_time = Date.now().valueOf() / 1000;
    step.execution.status = status;
  }

  private parseTag(tag: string): { key: string, value: string } | null {
    const [key, value] = tag.split('=');
    if (!key || !value) {
      return null;
    }

    return { key, value };
  }

    /**
   * @param {string} title
   * @returns {number[]}
   * @private
   */
    private static extractQaseIdsFromTitle(title: string) {
      const [, ids] = title.match(WDIOQaseReporter.qaseIdRegExp) ?? [];
  
      return ids ? ids.split(',').map((id) => Number(id)) : [];
    }

    /**
   * @param {string} title
   * @returns {string}
   * @private
   */
    private removeQaseIdsFromTitle(title: string): string {
      const matches = title.match(WDIOQaseReporter.qaseIdRegExp);
      if (matches) {
        return title.replace(matches[0], '').trimEnd();
      }
      return title;
    }
}
