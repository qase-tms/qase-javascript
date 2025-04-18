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
import { HashResponse } from '../model';
// @ts-ignore
import { SharedStepCreate } from '../model';
// @ts-ignore
import { SharedStepListResponse } from '../model';
// @ts-ignore
import { SharedStepResponse } from '../model';
// @ts-ignore
import { SharedStepUpdate } from '../model';
/**
 * SharedStepsApi - axios parameter creator
 * @export
 */
export const SharedStepsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * This method allows to create a shared step in selected project. 
         * @summary Create a new shared step
         * @param {string} code Code of project, where to search entities.
         * @param {SharedStepCreate} sharedStepCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createSharedStep: async (code: string, sharedStepCreate: SharedStepCreate, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('createSharedStep', 'code', code)
            // verify required parameter 'sharedStepCreate' is not null or undefined
            assertParamExists('createSharedStep', 'sharedStepCreate', sharedStepCreate)
            const localVarPath = `/shared_step/{code}`
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
            localVarRequestOptions.data = serializeDataIfNeeded(sharedStepCreate, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * This method completely deletes a shared step from repository. 
         * @summary Delete shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteSharedStep: async (code: string, hash: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('deleteSharedStep', 'code', code)
            // verify required parameter 'hash' is not null or undefined
            assertParamExists('deleteSharedStep', 'hash', hash)
            const localVarPath = `/shared_step/{code}/{hash}`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)))
                .replace(`{${"hash"}}`, encodeURIComponent(String(hash)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
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
        /**
         * This method allows to retrieve a specific shared step. 
         * @summary Get a specific shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedStep: async (code: string, hash: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('getSharedStep', 'code', code)
            // verify required parameter 'hash' is not null or undefined
            assertParamExists('getSharedStep', 'hash', hash)
            const localVarPath = `/shared_step/{code}/{hash}`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)))
                .replace(`{${"hash"}}`, encodeURIComponent(String(hash)));
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
        /**
         * This method allows to retrieve all shared steps stored in selected project. 
         * @summary Get all shared steps
         * @param {string} code Code of project, where to search entities.
         * @param {string} [search] Provide a string that will be used to search by name.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedSteps: async (code: string, search?: string, limit?: number, offset?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('getSharedSteps', 'code', code)
            const localVarPath = `/shared_step/{code}`
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

            if (search !== undefined) {
                localVarQueryParameter['search'] = search;
            }

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }

            if (offset !== undefined) {
                localVarQueryParameter['offset'] = offset;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * This method updates a shared step. 
         * @summary Update shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {SharedStepUpdate} sharedStepUpdate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateSharedStep: async (code: string, hash: string, sharedStepUpdate: SharedStepUpdate, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'code' is not null or undefined
            assertParamExists('updateSharedStep', 'code', code)
            // verify required parameter 'hash' is not null or undefined
            assertParamExists('updateSharedStep', 'hash', hash)
            // verify required parameter 'sharedStepUpdate' is not null or undefined
            assertParamExists('updateSharedStep', 'sharedStepUpdate', sharedStepUpdate)
            const localVarPath = `/shared_step/{code}/{hash}`
                .replace(`{${"code"}}`, encodeURIComponent(String(code)))
                .replace(`{${"hash"}}`, encodeURIComponent(String(hash)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PATCH', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication TokenAuth required
            await setApiKeyToObject(localVarHeaderParameter, "Token", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(sharedStepUpdate, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * SharedStepsApi - functional programming interface
 * @export
 */
export const SharedStepsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = SharedStepsApiAxiosParamCreator(configuration)
    return {
        /**
         * This method allows to create a shared step in selected project. 
         * @summary Create a new shared step
         * @param {string} code Code of project, where to search entities.
         * @param {SharedStepCreate} sharedStepCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createSharedStep(code: string, sharedStepCreate: SharedStepCreate, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<HashResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createSharedStep(code, sharedStepCreate, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method completely deletes a shared step from repository. 
         * @summary Delete shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteSharedStep(code: string, hash: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<HashResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSharedStep(code, hash, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method allows to retrieve a specific shared step. 
         * @summary Get a specific shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSharedStep(code: string, hash: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SharedStepResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSharedStep(code, hash, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method allows to retrieve all shared steps stored in selected project. 
         * @summary Get all shared steps
         * @param {string} code Code of project, where to search entities.
         * @param {string} [search] Provide a string that will be used to search by name.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSharedSteps(code: string, search?: string, limit?: number, offset?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SharedStepListResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSharedSteps(code, search, limit, offset, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method updates a shared step. 
         * @summary Update shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {SharedStepUpdate} sharedStepUpdate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateSharedStep(code: string, hash: string, sharedStepUpdate: SharedStepUpdate, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<HashResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.updateSharedStep(code, hash, sharedStepUpdate, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * SharedStepsApi - factory interface
 * @export
 */
export const SharedStepsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = SharedStepsApiFp(configuration)
    return {
        /**
         * This method allows to create a shared step in selected project. 
         * @summary Create a new shared step
         * @param {string} code Code of project, where to search entities.
         * @param {SharedStepCreate} sharedStepCreate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createSharedStep(code: string, sharedStepCreate: SharedStepCreate, options?: any): AxiosPromise<HashResponse> {
            return localVarFp.createSharedStep(code, sharedStepCreate, options).then((request) => request(axios, basePath));
        },
        /**
         * This method completely deletes a shared step from repository. 
         * @summary Delete shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteSharedStep(code: string, hash: string, options?: any): AxiosPromise<HashResponse> {
            return localVarFp.deleteSharedStep(code, hash, options).then((request) => request(axios, basePath));
        },
        /**
         * This method allows to retrieve a specific shared step. 
         * @summary Get a specific shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedStep(code: string, hash: string, options?: any): AxiosPromise<SharedStepResponse> {
            return localVarFp.getSharedStep(code, hash, options).then((request) => request(axios, basePath));
        },
        /**
         * This method allows to retrieve all shared steps stored in selected project. 
         * @summary Get all shared steps
         * @param {string} code Code of project, where to search entities.
         * @param {string} [search] Provide a string that will be used to search by name.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedSteps(code: string, search?: string, limit?: number, offset?: number, options?: any): AxiosPromise<SharedStepListResponse> {
            return localVarFp.getSharedSteps(code, search, limit, offset, options).then((request) => request(axios, basePath));
        },
        /**
         * This method updates a shared step. 
         * @summary Update shared step
         * @param {string} code Code of project, where to search entities.
         * @param {string} hash Hash.
         * @param {SharedStepUpdate} sharedStepUpdate 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateSharedStep(code: string, hash: string, sharedStepUpdate: SharedStepUpdate, options?: any): AxiosPromise<HashResponse> {
            return localVarFp.updateSharedStep(code, hash, sharedStepUpdate, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * SharedStepsApi - object-oriented interface
 * @export
 * @class SharedStepsApi
 * @extends {BaseAPI}
 */
export class SharedStepsApi extends BaseAPI {
    /**
     * This method allows to create a shared step in selected project. 
     * @summary Create a new shared step
     * @param {string} code Code of project, where to search entities.
     * @param {SharedStepCreate} sharedStepCreate 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public createSharedStep(code: string, sharedStepCreate: SharedStepCreate, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).createSharedStep(code, sharedStepCreate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method completely deletes a shared step from repository. 
     * @summary Delete shared step
     * @param {string} code Code of project, where to search entities.
     * @param {string} hash Hash.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public deleteSharedStep(code: string, hash: string, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).deleteSharedStep(code, hash, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method allows to retrieve a specific shared step. 
     * @summary Get a specific shared step
     * @param {string} code Code of project, where to search entities.
     * @param {string} hash Hash.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public getSharedStep(code: string, hash: string, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).getSharedStep(code, hash, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method allows to retrieve all shared steps stored in selected project. 
     * @summary Get all shared steps
     * @param {string} code Code of project, where to search entities.
     * @param {string} [search] Provide a string that will be used to search by name.
     * @param {number} [limit] A number of entities in result set.
     * @param {number} [offset] How many entities should be skipped.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public getSharedSteps(code: string, search?: string, limit?: number, offset?: number, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).getSharedSteps(code, search, limit, offset, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method updates a shared step. 
     * @summary Update shared step
     * @param {string} code Code of project, where to search entities.
     * @param {string} hash Hash.
     * @param {SharedStepUpdate} sharedStepUpdate 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public updateSharedStep(code: string, hash: string, sharedStepUpdate: SharedStepUpdate, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).updateSharedStep(code, hash, sharedStepUpdate, options).then((request) => request(this.axios, this.basePath));
    }
}
