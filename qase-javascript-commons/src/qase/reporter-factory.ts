import {
  InternalReporterInterface,
  TestOpsReporter,
  TestOpsMultiReporter,
  ReportReporter,
} from '../reporters';
import { ModeEnum, OptionsType } from '../options';
import { ConfigType } from '../config';
import { EnvApiEnum, EnvTestOpsEnum } from '../env';
import { LoggerInterface } from '../utils/logger';
import { DisabledException } from '../utils/disabled-exception';
import { HostData } from '../models/host-data';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { ClientV2 } from '../client/clientV2';
import { DriverEnum, FsWriter } from '../writer';

/**
 * Builds a mode-specific InternalReporterInterface. Throws DisabledException
 * for `ModeEnum.off` so callers can distinguish "disabled-by-config" from a
 * real failure.
 */
export class ReporterFactory {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly hostData: HostData,
  ) {}

  create(
    mode: ModeEnum,
    options: ConfigType & OptionsType,
    withState: boolean,
  ): InternalReporterInterface {
    switch (mode) {
      case ModeEnum.testops:
        return this.createTestOps(options, withState);
      case ModeEnum.testops_multi:
        return this.createTestOpsMulti(options, withState);
      case ModeEnum.report:
        return this.createReport(options);
      case ModeEnum.off:
        throw new DisabledException();
      default:
        throw new Error(`Unknown mode type`);
    }
  }

  private createTestOps(
    options: ConfigType & OptionsType,
    withState: boolean,
  ): TestOpsReporter {
    if (!options.testops?.api?.token) {
      throw new Error(
        `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops" mode`,
      );
    }
    if (!options.testops.project) {
      throw new Error(
        `Either "testops.project" parameter or "${EnvTestOpsEnum.project}" environment variable is required in "testops" mode`,
      );
    }

    const apiClient = new ClientV2(
      this.logger,
      options.testops as TestOpsOptionsType,
      options.environment,
      options.rootSuite,
      this.hostData,
      options.reporterName,
      options.frameworkPackage,
    );

    return new TestOpsReporter(
      this.logger,
      apiClient,
      withState,
      options.testops.project,
      options.testops.api.host,
      options.testops.batch?.size,
      options.testops.run?.id,
      options.testops.showPublicReportLink,
    );
  }

  private createTestOpsMulti(
    options: ConfigType & OptionsType,
    withState: boolean,
  ): TestOpsMultiReporter {
    if (!options.testops?.api?.token) {
      throw new Error(
        `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops_multi" mode`,
      );
    }

    const multi = options.testops_multi;
    if (!multi?.projects?.length) {
      throw new Error(
        '"testops_multi.projects" must contain at least one project with a "code" field',
      );
    }
    for (const p of multi.projects) {
      if (!p?.code) {
        throw new Error(
          'Each project in "testops_multi.projects" must have a "code" field',
        );
      }
    }

    return new TestOpsMultiReporter(
      this.logger,
      options.testops as TestOpsOptionsType,
      multi,
      withState,
      this.hostData,
      options.reporterName,
      options.frameworkPackage,
      options.environment,
      options.testops.api?.host,
      options.testops.batch?.size,
      options.testops.showPublicReportLink,
    );
  }

  private createReport(options: ConfigType & OptionsType): ReportReporter {
    const localOptions = options.report?.connections?.[DriverEnum.local];
    const writer = new FsWriter(localOptions);

    return new ReportReporter(
      this.logger,
      writer,
      options.frameworkPackage,
      options.reporterName,
      options.environment,
      options.rootSuite,
      options.testops?.run?.id,
      this.hostData,
    );
  }
}
