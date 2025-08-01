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



/**
 * Configuration for the cloud run, if applicable
 * @export
 * @interface RunCreateCloudRunConfig
 */
export interface RunCreateCloudRunConfig {
    /**
     * The browser to be used for the cloud run
     * @type {string}
     * @memberof RunCreateCloudRunConfig
     */
    'browser'?: RunCreateCloudRunConfigBrowserEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum RunCreateCloudRunConfigBrowserEnum {
    CHROMIUM = 'chromium',
    FIREFOX = 'firefox',
    WEBKIT = 'webkit'
}


