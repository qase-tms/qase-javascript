/* tslint:disable */
/* eslint-disable */
/**
 * Qase.io API
 * # Introduction  You can use our API to access [Qase.io](https://qase.io) API endpoints, which allows to retrieve information about entities stored in database and perform actions with them. The API is organized around [REST](http://en.wikipedia.org/wiki/Representational_State_Transfer).  # API Rate limits  Your application can make up to 200 API requests per minute.  Once the limit is exceeded, clients receive an HTTP 429 with a Retry-After: X header to indicate how long their timeout period is before they will be able to send requests again. The timeout period is set to 60 seconds once the limit is exceeded.  # Authentication  To authorize, use this code:  ```shell # With shell, you can just pass the correct header with each request curl \"https://api.qase.io/v1/api_endpoint\"   -H \"Token: api_token\"   -H \"Content-Type: application/json\" ```  Make sure to replace `api_token` with your API key.  Qase.io uses API tokens to authenticate requests. You can view an manage your API keys in [API tokens pages](https://app.qase.io/user/api/token).  Your API keys has the same access rights as your role in the app, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.  Qase API expects for the API key to be included in all API requests to the server in a header that looks like the following:  `Token: api_token`  You must replace `api_token` with your personal API key.  All API requests must be made over [HTTPS](http://en.wikipedia.org/wiki/HTTP_Secure). Calls made over plain HTTP will fail. API requests without authentication will also fail.  # Access rights  Qase.io is using Role-based Access Control system to restrict some features usage in Web interface and the same rules are applied to API methods. In description for each method you will find a rule name, that is required to perform an action through API. If you don\'t have enough access rights, you will receive an error with `403` status code.  # Errors  Qase API uses the following error codes:  Code | Meaning ---------- | ------- 400 | Bad Request - Your request is invalid. 401 | Unauthorized - Your API key is wrong. 403 | Forbidden - Your role doesn\'t have enough permissions to perform this action 404 | Not Found - The resource could not be found. 405 | Method Not Allowed - You tried to access a resource with an invalid method. 406 | Not Acceptable - You requested a format that isn\'t json. 410 | Gone - The resource requested has been removed from our servers. 429 | Too Many Requests - You\'re performing too many requests! Slow down! 500 | Internal Server Error - We had a problem with our server. Try again later. 503 | Service Unavailable - We\'re temporarily offline for maintenance. Please try again later. 
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
         * @summary Create a new shared step.
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
         * @summary Delete shared step.
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
         * @summary Get a specific shared step.
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
         * @summary Get all shared steps.
         * @param {string} code Code of project, where to search entities.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {object} [filters] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedSteps: async (code: string, limit?: number, offset?: number, filters?: object, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
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

            if (limit !== undefined) {
                localVarQueryParameter['limit'] = limit;
            }

            if (offset !== undefined) {
                localVarQueryParameter['offset'] = offset;
            }

            if (filters !== undefined) {
                localVarQueryParameter['filters'] = filters;
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
         * @summary Update shared step.
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
         * @summary Create a new shared step.
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
         * @summary Delete shared step.
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
         * @summary Get a specific shared step.
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
         * @summary Get all shared steps.
         * @param {string} code Code of project, where to search entities.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {object} [filters] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSharedSteps(code: string, limit?: number, offset?: number, filters?: object, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SharedStepListResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSharedSteps(code, limit, offset, filters, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This method updates a shared step. 
         * @summary Update shared step.
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
         * @summary Create a new shared step.
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
         * @summary Delete shared step.
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
         * @summary Get a specific shared step.
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
         * @summary Get all shared steps.
         * @param {string} code Code of project, where to search entities.
         * @param {number} [limit] A number of entities in result set.
         * @param {number} [offset] How many entities should be skipped.
         * @param {object} [filters] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSharedSteps(code: string, limit?: number, offset?: number, filters?: object, options?: any): AxiosPromise<SharedStepListResponse> {
            return localVarFp.getSharedSteps(code, limit, offset, filters, options).then((request) => request(axios, basePath));
        },
        /**
         * This method updates a shared step. 
         * @summary Update shared step.
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
     * @summary Create a new shared step.
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
     * @summary Delete shared step.
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
     * @summary Get a specific shared step.
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
     * @summary Get all shared steps.
     * @param {string} code Code of project, where to search entities.
     * @param {number} [limit] A number of entities in result set.
     * @param {number} [offset] How many entities should be skipped.
     * @param {object} [filters] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharedStepsApi
     */
    public getSharedSteps(code: string, limit?: number, offset?: number, filters?: object, options?: AxiosRequestConfig) {
        return SharedStepsApiFp(this.configuration).getSharedSteps(code, limit, offset, filters, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This method updates a shared step. 
     * @summary Update shared step.
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