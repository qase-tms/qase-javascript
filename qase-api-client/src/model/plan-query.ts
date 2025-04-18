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
 * 
 * @export
 * @interface PlanQuery
 */
export interface PlanQuery {
    /**
     * 
     * @type {number}
     * @memberof PlanQuery
     */
    'plan_id': number;
    /**
     * 
     * @type {number}
     * @memberof PlanQuery
     */
    'id'?: number;
    /**
     * 
     * @type {string}
     * @memberof PlanQuery
     */
    'title'?: string;
    /**
     * 
     * @type {string}
     * @memberof PlanQuery
     */
    'description'?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PlanQuery
     */
    'cases_count'?: number;
    /**
     * 
     * @type {string}
     * @memberof PlanQuery
     */
    'created_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof PlanQuery
     */
    'updated_at'?: string;
}

