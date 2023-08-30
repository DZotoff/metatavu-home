/* tslint:disable */
/* eslint-disable */
/**
 * Timebank
 * Timebank API documentation
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { ForecastWebhookObject } from './ForecastWebhookObject';
import {
    ForecastWebhookObjectFromJSON,
    ForecastWebhookObjectFromJSONTyped,
    ForecastWebhookObjectToJSON,
} from './ForecastWebhookObject';
import type { ForecastWebhookPerson } from './ForecastWebhookPerson';
import {
    ForecastWebhookPersonFromJSON,
    ForecastWebhookPersonFromJSONTyped,
    ForecastWebhookPersonToJSON,
} from './ForecastWebhookPerson';

/**
 * 
 * @export
 * @interface ForecastWebhookEvent
 */
export interface ForecastWebhookEvent {
    /**
     * String. A UTC timestamp of when the event happened
     * @type {string}
     * @memberof ForecastWebhookEvent
     */
    timestamp?: string;
    /**
     * String. A string consisting of the type of object and the type of event.
     * @type {string}
     * @memberof ForecastWebhookEvent
     */
    event?: string;
    /**
     * 
     * @type {ForecastWebhookObject}
     * @memberof ForecastWebhookEvent
     */
    object?: ForecastWebhookObject;
    /**
     * 
     * @type {ForecastWebhookPerson}
     * @memberof ForecastWebhookEvent
     */
    person?: ForecastWebhookPerson;
}

/**
 * Check if a given object implements the ForecastWebhookEvent interface.
 */
export function instanceOfForecastWebhookEvent(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ForecastWebhookEventFromJSON(json: any): ForecastWebhookEvent {
    return ForecastWebhookEventFromJSONTyped(json, false);
}

export function ForecastWebhookEventFromJSONTyped(json: any, ignoreDiscriminator: boolean): ForecastWebhookEvent {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'timestamp': !exists(json, 'timestamp') ? undefined : json['timestamp'],
        'event': !exists(json, 'event') ? undefined : json['event'],
        'object': !exists(json, 'object') ? undefined : ForecastWebhookObjectFromJSON(json['object']),
        'person': !exists(json, 'person') ? undefined : ForecastWebhookPersonFromJSON(json['person']),
    };
}

export function ForecastWebhookEventToJSON(value?: ForecastWebhookEvent | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'timestamp': value.timestamp,
        'event': value.event,
        'object': ForecastWebhookObjectToJSON(value.object),
        'person': ForecastWebhookPersonToJSON(value.person),
    };
}

