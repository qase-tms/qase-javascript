import axios from 'axios';
import * as axiosRetry from 'axios-retry';

import {
  ProjectsApi,
  CasesApi,
  ResultApi,
  ResultsApi,
  RunsApi,
  AttachmentsApi,
  PlansApi,
  SuitesApi,
  MilestonesApi,
  SharedStepsApi,
  DefectsApi,
  CustomFieldsApi,
  AuthorsApi,
  Configuration, EnvironmentsApi,
} from './generated';

export interface QaseApiOptionsType {
  token: string;
  host?: string | undefined;
  headers?: Record<string, string | undefined> | undefined;
  retries?: number | undefined;
  retryDelay?: number | undefined;
}

export interface QaseApiInterface {
  projects: ProjectsApi;
  cases: CasesApi;
  result: ResultApi;
  results: ResultsApi;
  runs: RunsApi;
  attachments: AttachmentsApi;
  plans: PlansApi;
  suites: SuitesApi;
  milestones: MilestonesApi;
  sharedSteps: SharedStepsApi;
  defects: DefectsApi;
  customFields: CustomFieldsApi;
  authors: AuthorsApi;
  environment: EnvironmentsApi;
}

/**
 * @class QaseApi
 * @implements QaseApiInterface
 */
export class QaseApi implements QaseApiInterface {
  public projects: ProjectsApi;
  public cases: CasesApi;
  public result: ResultApi;
  public results: ResultsApi;
  public runs: RunsApi;
  public attachments: AttachmentsApi;
  public plans: PlansApi;
  public suites: SuitesApi;
  public milestones: MilestonesApi;
  public sharedSteps: SharedStepsApi;
  public defects: DefectsApi;
  public customFields: CustomFieldsApi;
  public authors: AuthorsApi;
  public environment: EnvironmentsApi;

  /**
   * @param {QaseApiOptionsType} options
   * @param {{new(): unknown}} formDataCtor
   */
  public constructor(
    options: QaseApiOptionsType,
    formDataCtor?: new () => unknown,
  ) {
    const {
      token,
      host,
      headers,
      retries = 3,
      retryDelay = 0,
    } = options;

    const transport = axios.create({
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    axiosRetry(transport, {
      retries,
      retryDelay: () => retryDelay,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      retryCondition: axiosRetry.isIdempotentRequestError,
    });

    const configuration = new Configuration({
      apiKey: token,
      formDataCtor,
    });

    // default path is https://api.qase.io, defined in
    // qaseio/src/generated/base.ts
    if (host != undefined) {
      if (host == 'qase.io' || host == 'api.qase.io' || host == 'https://api.qase.io') {
        configuration.basePath = `https://api.qase.io`;
      } else if (host == 'http://api.qase.lo') {
        // Qase on local machine, development mode
        configuration.basePath = host
      } else {
        // Custom Qase host
        configuration.basePath = `https://${host}`;
      }
    }

    this.projects = new ProjectsApi(configuration, host, transport);
    this.cases = new CasesApi(configuration, host, transport);
    this.result = new ResultApi(configuration, host, transport);
    this.results = new ResultsApi(configuration, host, transport);
    this.runs = new RunsApi(configuration, host, transport);
    this.attachments = new AttachmentsApi(configuration, host, transport);
    this.plans = new PlansApi(configuration, host, transport);
    this.suites = new SuitesApi(configuration, host, transport);
    this.milestones = new MilestonesApi(configuration, host, transport);
    this.sharedSteps = new SharedStepsApi(configuration, host, transport);
    this.defects = new DefectsApi(configuration, host, transport);
    this.customFields = new CustomFieldsApi(configuration, host, transport);
    this.authors = new AuthorsApi(configuration, host, transport);
    this.environment = new EnvironmentsApi(configuration, host, transport);
  }
}
