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


import { SharedStepContent } from './shared-step-content';

/**
 * 
 * @export
 * @interface SharedStep
 */
export interface SharedStep {
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'hash'?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'title'?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'action'?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'expected_result'?: string;
    /**
     * 
     * @type {Array<SharedStepContent>}
     * @memberof SharedStep
     */
    'steps'?: Array<SharedStepContent>;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'data'?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof SharedStep
     */
    'cases'?: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof SharedStep
     */
    'cases_count'?: number;
    /**
     * Deprecated, use the `created_at` property instead.
     * @type {string}
     * @memberof SharedStep
     * @deprecated
     */
    'created'?: string;
    /**
     * Deprecated, use the `updated_at` property instead.
     * @type {string}
     * @memberof SharedStep
     * @deprecated
     */
    'updated'?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'created_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedStep
     */
    'updated_at'?: string;
}

