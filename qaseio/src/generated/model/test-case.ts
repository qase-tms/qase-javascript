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


import { Attachment } from './attachment';
import { CustomFieldValue } from './custom-field-value';
import { ExternalIssue } from './external-issue';
import { TagValue } from './tag-value';
import { TestCaseParams } from './test-case-params';
import { TestStep } from './test-step';

/**
 * 
 * @export
 * @interface TestCase
 */
export interface TestCase {
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'id'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'position'?: number;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'title'?: string;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'description'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'preconditions'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'postconditions'?: string | null;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'severity'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'priority'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'type'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'layer'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'is_flaky'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'behavior'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'automation'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'status'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'milestone_id'?: number | null;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'suite_id'?: number | null;
    /**
     * 
     * @type {Array<CustomFieldValue>}
     * @memberof TestCase
     */
    'custom_fields'?: Array<CustomFieldValue>;
    /**
     * 
     * @type {Array<Attachment>}
     * @memberof TestCase
     */
    'attachments'?: Array<Attachment>;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'steps_type'?: string | null;
    /**
     * 
     * @type {Array<TestStep>}
     * @memberof TestCase
     */
    'steps'?: Array<TestStep>;
    /**
     * 
     * @type {TestCaseParams}
     * @memberof TestCase
     */
    'params'?: TestCaseParams;
    /**
     * 
     * @type {Array<TagValue>}
     * @memberof TestCase
     */
    'tags'?: Array<TagValue>;
    /**
     * Deprecated, use `author_id` instead.
     * @type {number}
     * @memberof TestCase
     * @deprecated
     */
    'member_id'?: number;
    /**
     * 
     * @type {number}
     * @memberof TestCase
     */
    'author_id'?: number;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'created_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     */
    'updated_at'?: string;
    /**
     * 
     * @type {string}
     * @memberof TestCase
     * @deprecated
     */
    'deleted'?: string | null;
    /**
     * Deprecated, use the `created_at` property instead.
     * @type {string}
     * @memberof TestCase
     * @deprecated
     */
    'created'?: string;
    /**
     * Deprecated, use the `updated_at` property instead.
     * @type {string}
     * @memberof TestCase
     * @deprecated
     */
    'updated'?: string;
    /**
     * 
     * @type {Array<ExternalIssue>}
     * @memberof TestCase
     */
    'external_issues'?: Array<ExternalIssue>;
}

