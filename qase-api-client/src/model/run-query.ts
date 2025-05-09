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


import { CustomFieldValue } from './custom-field-value';
import { RunEnvironment } from './run-environment';
import { RunMilestone } from './run-milestone';
import { RunStats } from './run-stats';
import { TagValue } from './tag-value';

/**
 * 
 * @export
 * @interface RunQuery
 */
export interface RunQuery {
    /**
     * 
     * @type {number}
     * @memberof RunQuery
     */
    'run_id': number;
    /**
     * 
     * @type {number}
     * @memberof RunQuery
     */
    'id'?: number;
    /**
     * 
     * @type {string}
     * @memberof RunQuery
     */
    'title'?: string;
    /**
     * 
     * @type {string}
     * @memberof RunQuery
     */
    'description'?: string | null;
    /**
     * 
     * @type {number}
     * @memberof RunQuery
     */
    'status'?: number;
    /**
     * 
     * @type {string}
     * @memberof RunQuery
     */
    'status_text'?: string;
    /**
     * 
     * @type {string}
     * @memberof RunQuery
     */
    'start_time'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof RunQuery
     */
    'end_time'?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof RunQuery
     */
    'public'?: boolean;
    /**
     * 
     * @type {RunStats}
     * @memberof RunQuery
     */
    'stats'?: RunStats;
    /**
     * Time in ms.
     * @type {number}
     * @memberof RunQuery
     */
    'time_spent'?: number;
    /**
     * Time in ms.
     * @type {number}
     * @memberof RunQuery
     */
    'elapsed_time'?: number;
    /**
     * 
     * @type {RunEnvironment}
     * @memberof RunQuery
     */
    'environment'?: RunEnvironment | null;
    /**
     * 
     * @type {RunMilestone}
     * @memberof RunQuery
     */
    'milestone'?: RunMilestone | null;
    /**
     * 
     * @type {Array<CustomFieldValue>}
     * @memberof RunQuery
     */
    'custom_fields'?: Array<CustomFieldValue>;
    /**
     * 
     * @type {Array<TagValue>}
     * @memberof RunQuery
     */
    'tags'?: Array<TagValue>;
    /**
     * 
     * @type {Array<number>}
     * @memberof RunQuery
     */
    'cases'?: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof RunQuery
     */
    'plan_id'?: number | null;
}

