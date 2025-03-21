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



/**
 * 
 * @export
 * @interface ResultExecution
 */
export interface ResultExecution {
    /**
     * Can have the following values passed, failed, blocked, skipped, invalid + custom statuses
     * @type {string}
     * @memberof ResultExecution
     */
    'status': string;
    /**
     * Unix epoch time in seconds (whole part) and milliseconds (fractional part).
     * @type {number}
     * @memberof ResultExecution
     */
    'start_time'?: number | null;
    /**
     * Unix epoch time in seconds (whole part) and milliseconds (fractional part).
     * @type {number}
     * @memberof ResultExecution
     */
    'end_time'?: number | null;
    /**
     * Duration of the test execution in milliseconds.
     * @type {number}
     * @memberof ResultExecution
     */
    'duration'?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ResultExecution
     */
    'stacktrace'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ResultExecution
     */
    'thread'?: string | null;
}

