/* tslint:disable */
/* eslint-disable */
/**
 * Qase.io TestOps API v2
 * Qase TestOps API v2 Specification.
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@qase.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { ResultStepStatus } from './result-step-status';

/**
 * 
 * @export
 * @interface ResultStepExecution
 */
export interface ResultStepExecution {
    /**
     * 
     * @type {ResultStepStatus}
     * @memberof ResultStepExecution
     */
    'status': ResultStepStatus;
    /**
     * Unix epoch time in seconds (whole part) and milliseconds (fractional part).
     * @type {number}
     * @memberof ResultStepExecution
     */
    'start_time'?: number | null;
    /**
     * Unix epoch time in seconds (whole part) and milliseconds (fractional part).
     * @type {number}
     * @memberof ResultStepExecution
     */
    'end_time'?: number | null;
    /**
     * Duration of the test step execution in milliseconds.
     * @type {number}
     * @memberof ResultStepExecution
     */
    'duration'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ResultStepExecution
     */
    'comment'?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof ResultStepExecution
     */
    'attachments'?: Array<string>;
}



