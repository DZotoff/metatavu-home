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


/**
 * Enum for vacation request status
 * @export
 */
export const VacationRequestStatuses = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED'
} as const;
export type VacationRequestStatuses = typeof VacationRequestStatuses[keyof typeof VacationRequestStatuses];


export function VacationRequestStatusesFromJSON(json: any): VacationRequestStatuses {
    return VacationRequestStatusesFromJSONTyped(json, false);
}

export function VacationRequestStatusesFromJSONTyped(json: any, ignoreDiscriminator: boolean): VacationRequestStatuses {
    return json as VacationRequestStatuses;
}

export function VacationRequestStatusesToJSON(value?: VacationRequestStatuses | null): any {
    return value as any;
}

