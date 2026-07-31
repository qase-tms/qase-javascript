import { Configuration as ConfigurationV1 } from 'qase-api-client';
import { Configuration as ConfigurationV2 } from 'qase-api-v2-client';
import FormData from 'form-data';
import { TestOpsOptionsType } from '../../models/config/TestOpsOptionsType';
import { HostData } from '../../models/host-data';
import { apiLabelToAppInUrl, isAbsoluteUrl, stripTrailingSlashes } from '../../utils/api-host';

const DEFAULT_API_HOST = 'qase.io';
const API_BASE_URL = 'https://api-';
const APP_BASE_URL = 'https://';
const API_V1 = '/v1';
const API_V2 = '/v2';

function resolveBasePath(host: string | undefined, version: string): string {
  // A host carrying a scheme is a complete base URL — the only shape that can express a custom
  // scheme, port or path prefix — so use it as given instead of interpolating Qase's convention.
  if (host && isAbsoluteUrl(host)) {
    return `${stripTrailingSlashes(host)}${version}`;
  }
  if (host && host !== DEFAULT_API_HOST) {
    return `${API_BASE_URL}${host}${version}`;
  }
  return `https://api.${DEFAULT_API_HOST}${version}`;
}

export function resolveAppUrl(config: TestOpsOptionsType): string {
  if (config.api.host && isAbsoluteUrl(config.api.host)) {
    // The API base URL doubles as the app origin here, so swap the `api.` label when there is
    // one. Bare host fragments keep their historical behaviour below (no swap).
    return apiLabelToAppInUrl(stripTrailingSlashes(config.api.host));
  }
  if (config.api.host && config.api.host !== DEFAULT_API_HOST) {
    return `${APP_BASE_URL}${config.api.host}`;
  }
  return `https://app.${DEFAULT_API_HOST}`;
}

export function createApiConfigV1(config: TestOpsOptionsType): ConfigurationV1 {
  const apiConfig = new ConfigurationV1({ apiKey: config.api.token, formDataCtor: FormData });
  apiConfig.basePath = resolveBasePath(config.api.host, API_V1);
  return apiConfig;
}

export function createApiConfigV2(
  config: TestOpsOptionsType,
  hostData?: HostData,
  reporterName?: string,
  frameworkName?: string,
): ConfigurationV2 {
  const apiConfig = new ConfigurationV2({ apiKey: config.api.token, formDataCtor: FormData });
  apiConfig.basePath = resolveBasePath(config.api.host, API_V2);

  if (hostData) {
    const headers = buildHeaders(hostData, reporterName, frameworkName);
    const existingHeaders = (apiConfig.baseOptions as { headers?: Record<string, string> } | undefined)?.headers ?? {};
    const baseOptionsWithHeaders: { headers: Record<string, string> } = {
      ...(apiConfig.baseOptions as Record<string, unknown> ?? {}),
      headers: {
        ...existingHeaders,
        ...headers,
      },
    };
    apiConfig.baseOptions = baseOptionsWithHeaders;
  }

  return apiConfig;
}

export function buildHeaders(
  hostData: HostData,
  reporterName?: string,
  frameworkName?: string,
): Record<string, string> {
  const headers: Record<string, string> = {};

  const clientParts: string[] = [];
  if (reporterName?.trim()) {
    clientParts.push(`reporter=${reporterName}`);
  }
  if (hostData.reporter?.trim()) {
    clientParts.push(`reporter_version=${hostData.reporter}`);
  }
  if (frameworkName?.trim()) {
    clientParts.push(`framework=${frameworkName}`);
  }
  if (hostData.framework?.trim()) {
    clientParts.push(`framework_version=${hostData.framework}`);
  }
  if (hostData.apiClientV1?.trim()) {
    clientParts.push(`client_version_v1=${hostData.apiClientV1}`);
  }
  if (hostData.apiClientV2?.trim()) {
    clientParts.push(`client_version_v2=${hostData.apiClientV2}`);
  }
  if (hostData.commons?.trim()) {
    clientParts.push(`core_version=${hostData.commons}`);
  }

  if (clientParts.length > 0) {
    headers['X-Client'] = clientParts.join(';');
  }

  const platformParts: string[] = [];
  if (hostData.system?.trim()) {
    platformParts.push(`os=${hostData.system}`);
  }
  if (hostData.arch?.trim()) {
    platformParts.push(`arch=${hostData.arch}`);
  }
  if (hostData.language?.trim()) {
    platformParts.push(`node=${hostData.language}`);
  }
  if (hostData.packageManager?.trim()) {
    platformParts.push(`npm=${hostData.packageManager}`);
  }

  if (platformParts.length > 0) {
    headers['X-Platform'] = platformParts.join(';');
  }

  return headers;
}
