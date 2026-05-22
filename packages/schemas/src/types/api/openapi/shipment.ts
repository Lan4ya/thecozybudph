export interface paths {
    "/shipment/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get shipment order details */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            code: string;
                            details?: unknown;
                        };
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            code: string;
                            details?: unknown;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/shipment/quotes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        senderAddress?: {
                            region: string;
                            city: string;
                            province?: string | null;
                            postalCode: string;
                            barangay: string;
                            addressLine: string;
                        };
                        recipientAddress: {
                            region: string;
                            city: string;
                            province?: string | null;
                            postalCode: string;
                            barangay: string;
                            addressLine: string;
                        };
                        /** @enum {string} */
                        serviceType?: "motorcycle" | "sedan";
                    };
                };
            };
            responses: {
                /** @description Create shipment quotes */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                /** Format: date-time */
                                scheduleAt: string;
                                serviceType: string;
                                specialRequests: string[];
                                /** Format: date-time */
                                expiresAt: string;
                                priceBreakdown: {
                                    base?: string;
                                    extraMileage?: string;
                                    surcharge?: string;
                                    coupon?: string;
                                    specialRequests?: string;
                                    priorityFee?: string;
                                    priorityFeeVat?: string;
                                    specialVehicle?: string;
                                    minimumSurcharge?: string;
                                    discountCap?: string;
                                    insurance?: string;
                                    multiStopSurcharge?: string;
                                    surchargeDiscount?: string;
                                    vat?: string;
                                    customerSupportDiscretionary?: string;
                                    totalBeforeOptimization?: string;
                                    totalExcludePriorityFee?: string;
                                    total: string;
                                    currency: string;
                                };
                                isRouteOptimized: boolean;
                                stops: {
                                    /** Format: uuid */
                                    id?: string;
                                    coordinates: {
                                        lat: string;
                                        lng: string;
                                    };
                                    address: string;
                                }[];
                            }[];
                        };
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            code: string;
                            details?: unknown;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
