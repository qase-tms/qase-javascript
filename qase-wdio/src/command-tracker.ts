import { AfterCommandArgs, BeforeCommandArgs } from '@wdio/reporter';
import { TestStepType } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { TestLifecycle } from './lifecycle';
import { Storage } from './storage';
import { QaseReporterOptions } from './options';
import { isEmpty, isScreenshotCommand } from './utils';

export class CommandTracker {
  private isMultiremote = false;
  private profilerStepSnapshot = 0;

  constructor(
    private readonly lifecycle: TestLifecycle,
    private readonly storage: Storage,
    private readonly options: QaseReporterOptions,
    private readonly profiler: NetworkProfiler | null,
  ) {}

  setMultiremote(value: boolean): void {
    this.isMultiremote = value;
  }

  onBeforeCommand(command: BeforeCommandArgs): void {
    if (!this.storage.getLastItem()) {
      return;
    }
    if (this.options.disableWebdriverStepsReporting || this.isMultiremote) {
      return;
    }
    const { method, endpoint } = command;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const stepName = command.command ? command.command : `${method} ${endpoint}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = command.body || command.params;
    this.lifecycle.startStep(stepName);
    if (!isEmpty(payload)) {
      this.lifecycle.attachJSON('Request', payload);
    }
  }

  onAfterCommand(command: AfterCommandArgs): void {
    const { disableWebdriverStepsReporting, disableWebdriverScreenshotsReporting } = this.options;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const commandResult: string | undefined = command.result.value || undefined;
    const isScreenshot = isScreenshotCommand(command);
    // A screenshot taken outside a test (e.g. in a before hook) has no result to attach to.
    if (!disableWebdriverScreenshotsReporting && isScreenshot && commandResult && this.storage.getLastItem()) {
      this.lifecycle.attachFile('Screenshot.png', Buffer.from(commandResult, 'base64'), 'image/png');
    }
    if (disableWebdriverStepsReporting || this.isMultiremote || !this.storage.getCurrentStep()) {
      return;
    }
    // Commands such as navigateTo return nothing; an attachment would only say "undefined".
    if (commandResult !== undefined) {
      this.lifecycle.attachJSON('Response', commandResult);
    }
    this.lifecycle.endStep();
  }

  takeProfilerSnapshot(): void {
    this.profilerStepSnapshot = this.profiler?.getAllSteps().length ?? 0;
  }

  drainNewProfilerSteps(): TestStepType[] {
    if (!this.profiler) {
      return [];
    }
    const all = this.profiler.getAllSteps();
    const slice = all.slice(this.profilerStepSnapshot);
    this.profilerStepSnapshot = 0;
    return slice;
  }
}
