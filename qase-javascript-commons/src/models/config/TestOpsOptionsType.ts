/**
 * Per-project configuration for multi-project (testops_multi) mode.
 */
export interface TestOpsProjectConfigType {
  code: string;
  run?: TestOpsRunType;
  plan?: TestOpsPlanType;
  environment?: string;
}

/**
 * Multi-project TestOps configuration.
 */
export interface TestOpsMultiConfigType {
  /** Default project for tests without explicit mapping (and for results without any case ID). */
  default_project?: string;
  /** List of project configurations. */
  projects: TestOpsProjectConfigType[];
}

export interface TestOpsOptionsType {
  project: string;
  uploadAttachments?: boolean | undefined;
  api: TestOpsApiType;
  run: TestOpsRunType;
  plan: TestOpsPlanType;
  batch?: TestOpsBatchType;
  defect?: boolean | undefined;
  configurations?: TestOpsConfigurationType | undefined;
  statusFilter?: string[] | undefined;
  showPublicReportLink?: boolean | undefined;
}

export interface TestOpsConfigurationType {
  values: TestOpsConfigurationValueType[];
  createIfNotExists?: boolean | undefined;
}

export interface TestOpsConfigurationValueType {
  name: string;
  value: string;
}

export enum ExternalLinkType {
  JIRA_CLOUD = 'jiraCloud',
  JIRA_SERVER = 'jiraServer',
}

export interface TestOpsExternalLinkType {
  type: ExternalLinkType;
  link: string;
}

export interface TestOpsRunType {
  id?: number | undefined;
  title?: string;
  description?: string;
  complete?: boolean | undefined;
  tags?: string[] | undefined;
  externalLink?: TestOpsExternalLinkType | undefined;
}

export interface TestOpsPlanType {
  id?: number | undefined;
}

export interface TestOpsBatchType {
  size?: number | undefined;
}

export interface TestOpsApiType {
  token: string;
  host?: string | undefined;
}

