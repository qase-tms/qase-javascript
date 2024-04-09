/**
 * @enum {string}
 */
export enum EnvEnum {
  mode = 'QASE_MODE',
  fallback = 'QASE_FALLBACK',
  debug = 'QASE_DEBUG',
  environment = 'QASE_ENVIRONMENT',
  captureLogs = 'QASE_CAPTURE_LOGS',
}

/**
 * @enum {string}
 */
export enum EnvTestOpsEnum {
  project = 'QASE_TESTOPS_PROJECT',
  uploadAttachments = 'QASE_TESTOPS_UPLOAD_ATTACHMENTS',
  chunk = 'QASE_TESTOPS_CHUNK',
  defect = 'QASE_TESTOPS_DEFECT',
}

/**
 * @enum {string}
 */
export enum EnvApiEnum {
  token = 'QASE_TESTOPS_API_TOKEN',
  baseUrl = 'QASE_TESTOPS_API_HOST',
}

/**
 * @enum {string}
 */
export enum EnvRunEnum {
  id = 'QASE_TESTOPS_RUN_ID',
  title = 'QASE_TESTOPS_RUN_TITLE',
  description = 'QASE_TESTOPS_RUN_DESCRIPTION',
  complete = 'QASE_TESTOPS_RUN_COMPLETE'
}

/**
 * @enum {string}
 */
export enum EnvPlanEnum {
  id = 'QASE_TESTOPS_PLAN_ID',
}

/**
 * @enum {string}
 */
export enum EnvLocalEnum {
  path = 'QASE_REPORT_CONNECTION_PATH',
  format = 'QASE_REPORT_CONNECTION_FORMAT',
}
