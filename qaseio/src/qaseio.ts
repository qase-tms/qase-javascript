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

export type QaseApiOptionsType = {
  token: string;
  baseUrl?: string | undefined;
  headers?: Record<string, string | undefined> | undefined;
  retries?: number | undefined;
  retryDelay?: number | undefined;
};

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
      baseUrl,
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

    this.projects = new ProjectsApi(configuration, baseUrl, transport);
    this.cases = new CasesApi(configuration, baseUrl, transport);
    this.result = new ResultApi(configuration, baseUrl, transport);
    this.results = new ResultsApi(configuration, baseUrl, transport);
    this.runs = new RunsApi(configuration, baseUrl, transport);
    this.attachments = new AttachmentsApi(configuration, baseUrl, transport);
    this.plans = new PlansApi(configuration, baseUrl, transport);
    this.suites = new SuitesApi(configuration, baseUrl, transport);
    this.milestones = new MilestonesApi(configuration, baseUrl, transport);
    this.sharedSteps = new SharedStepsApi(configuration, baseUrl, transport);
    this.defects = new DefectsApi(configuration, baseUrl, transport);
    this.customFields = new CustomFieldsApi(configuration, baseUrl, transport);
    this.authors = new AuthorsApi(configuration, baseUrl, transport);
    this.environment = new EnvironmentsApi(configuration, baseUrl, transport);
  }
}
