/* tslint:disable */
/* eslint-disable */
/**
 * Qase.io TestOps API v1
 * Qase TestOps API v1 Specification.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@qase.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { ConfigurationCreate } from '../model';
// @ts-ignore
import { ConfigurationGroupCreate } from '../model';
// @ts-ignore
import { ConfigurationListResponse } from '../model';
// @ts-ignore
import { IdResponse } from '../model';
/**
 * ConfigurationsApi - axios parameter creator
 * @export
 */
export const ConfigurationsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * This method allows to create a configuration in selected project. 
         * @summary Create a new configuration in a particular group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationCreate} configurationCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createConfiguration: async (code: string, configurationCreate: ConfigurationCreate, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('createConfiguration', 'code', code)
            // verify required parameter 'configurationCreate' is not null or undefined
            assertParamExists('createConfiguration', 'configurationCreate', configurationCreate)
            const localVarPath = `/configuration/{code}`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication TokenAuth required
            await setApiKeyToObject(localVarHeaderParameter, "Token", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(configurationCreate, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * This method allows to create a configuration group in selected project. 
         * @summary Create a new configuration group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationGroupCreate} configurationGroupCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createConfigurationGroup: async (code: string, configurationGroupCreate: ConfigurationGroupCreate, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('createConfigurationGroup', 'code', code)
            // verify required parameter 'configurationGroupCreate' is not null or undefined
            assertParamExists('createConfigurationGroup', 'configurationGroupCreate', configurationGroupCreate)
            const localVarPath = `/configuration/{code}/group`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication TokenAuth required
            await setApiKeyToObject(localVarHeaderParameter, "Token", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(configurationGroupCreate, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * This method allows to retrieve all configurations groups with configurations 
         * @summary Get all configuration groups with configurations.
         * @param {string} code Code of project, where to search entities.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConfigurations: async (code: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('getConfigurations', 'code', code)
            const localVarPath = `/configuration/{code}`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication TokenAuth required
            await setApiKeyToObject(localVarHeaderParameter, "Token", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ConfigurationsApi - functional programming interface
 * @export
 */
export const ConfigurationsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ConfigurationsApiAxiosParamCreator(configuration)
    return {
        /**
         * This method allows to create a configuration in selected project. 
         * @summary Create a new configuration in a particular group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationCreate} configurationCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createConfiguration(code: string, configurationCreate: ConfigurationCreate, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<IdResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createConfiguration(code, configurationCreate, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method allows to create a configuration group in selected project. 
         * @summary Create a new configuration group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationGroupCreate} configurationGroupCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createConfigurationGroup(code: string, configurationGroupCreate: ConfigurationGroupCreate, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<IdResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createConfigurationGroup(code, configurationGroupCreate, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method allows to retrieve all configurations groups with configurations 
         * @summary Get all configuration groups with configurations.
         * @param {string} code Code of project, where to search entities.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getConfigurations(code: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ConfigurationListResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getConfigurations(code, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * ConfigurationsApi - factory interface
 * @export
 */
export const ConfigurationsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ConfigurationsApiFp(configuration)
    return {
        /**
         * This method allows to create a configuration in selected project. 
         * @summary Create a new configuration in a particular group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationCreate} configurationCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createConfiguration(code: string, configurationCreate: ConfigurationCreate, options?: any): AxiosPromise<IdResponse> {
            return localVarFp.createConfiguration(code, configurationCreate, options).then((request) => request(axios, basePath));
        },
        /**
         * This method allows to create a configuration group in selected project. 
         * @summary Create a new configuration group.
         * @param {string} code Code of project, where to search entities.
         * @param {ConfigurationGroupCreate} configurationGroupCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createConfigurationGroup(code: string, configurationGroupCreate: ConfigurationGroupCreate, options?: any): AxiosPromise<IdResponse> {
            return localVarFp.createConfigurationGroup(code, configurationGroupCreate, options).then((request) => request(axios, basePath));
        },
        /**
         * This method allows to retrieve all configurations groups with configurations 
         * @summary Get all configuration groups with configurations.
         * @param {string} code Code of project, where to search entities.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConfigurations(code: string, options?: any): AxiosPromise<ConfigurationListResponse> {
            return localVarFp.getConfigurations(code, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ConfigurationsApi - object-oriented interface
 * @export
 * @class ConfigurationsApi
 * @extends {BaseAPI}
 */
export class ConfigurationsApi extends BaseAPI {
    /**
     * This method allows to create a configuration in selected project. 
     * @summary Create a new configuration in a particular group.
     * @param {string} code Code of project, where to search entities.
     * @param {ConfigurationCreate} configurationCreate 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigurationsApi
     */
    public createConfiguration(code: string, configurationCreate: ConfigurationCreate, options?: AxiosRequestConfig) {
        return ConfigurationsApiFp(this.configuration).createConfiguration(code, configurationCreate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method allows to create a configuration group in selected project. 
     * @summary Create a new configuration group.
     * @param {string} code Code of project, where to search entities.
     * @param {ConfigurationGroupCreate} configurationGroupCreate 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigurationsApi
     */
    public createConfigurationGroup(code: string, configurationGroupCreate: ConfigurationGroupCreate, options?: AxiosRequestConfig) {
        return ConfigurationsApiFp(this.configuration).createConfigurationGroup(code, configurationGroupCreate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method allows to retrieve all configurations groups with configurations 
     * @summary Get all configuration groups with configurations.
     * @param {string} code Code of project, where to search entities.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConfigurationsApi
     */
    public getConfigurations(code: string, options?: AxiosRequestConfig) {
        return ConfigurationsApiFp(this.configuration).getConfigurations(code, options).then((request) => request(this.axios, this.basePath));
    }
}
