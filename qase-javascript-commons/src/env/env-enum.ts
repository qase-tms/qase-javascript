/**
 * @enum {string}
 */
export enum EnvEnum {
  mode = 'QASE_MODE',
  debug = 'QASE_DEBUG',
  environment = 'QASE_ENVIRONMENT',
}

/**
 * @enum {string}
 */
export enum EnvTestOpsEnum {
  project = 'QASE_TESTOPS_PROJECT',
  baseUrl = 'QASE_TESTOPS_BASE_URL',
  uploadAttachments = 'QASE_TESTOPS_UPLOAD_ATTACHMENTS',
}

/**
 * @enum {string}
 */
export enum EnvApiEnum {
  token = 'QASE_TESTOPS_API_TOKEN',
  baseUrl = 'QASE_TESTOPS_API_BASE_URL',
}

/**
 * @enum {string}
 */
export enum EnvRunEnum {
  id = 'QASE_TESTOPS_RUN_ID',
  title = 'QASE_TESTOPS_RUN_TITLE',
  description = 'QASE_TESTOPS_RUN_DESCRIPTION',
  complete = 'QASE_TESTOPS_RUN_COMPLETE',
  environment = 'QASE_TESTOPS_ENVIRONMENT',
}

/**
 * @enum {string}
 */
export enum EnvLocalEnum {
  path = 'QASE_REPORT_CONNECTIONS_LOCAL_PATH',
  ext = 'QASE_REPORT_CONNECTIONS_LOCAL_EXT',
}
