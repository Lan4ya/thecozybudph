export interface paths {
    "/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled";
                    limit?: number;
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Query user orders */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                /** @enum {string} */
                                status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled";
                                /** @enum {string} */
                                serviceType: "motorcycle" | "sedan";
                                items: {
                                    /** Format: uuid */
                                    orderId: string;
                                    /** Format: uuid */
                                    id: string;
                                    /** Format: uuid */
                                    productId: string | null;
                                    /** Format: uuid */
                                    productVariantId: string | null;
                                    quantity: number;
                                    cardMessages: string[];
                                    name: string;
                                    collection: string | null;
                                    category: string;
                                    /** Format: uri */
                                    primaryImageUrl: string;
                                    variantAttributes: {
                                        [key: string]: string;
                                    };
                                    priceCents: number;
                                }[];
                                subtotalCents: number;
                                discountCents: number;
                                shippingCents: number;
                                passOnFee: number;
                                totalCents: number;
                                address: {
                                    fullName: string;
                                    region: string;
                                    city: string;
                                    province?: string | null;
                                    postalCode: string;
                                    barangay: string;
                                    addressLine: string;
                                    phoneNumber: string;
                                };
                                /** Format: date-time */
                                createdAt: string | null;
                                /** Format: date-time */
                                expiresAt: string;
                            }[];
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
            };
        };
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
                        /** @enum {string} */
                        source: "shop" | "cart";
                        items: {
                            quantity: number;
                            /** Format: uuid */
                            productId: string;
                            /** Format: uuid */
                            variantId: string;
                            cardMessages?: string[];
                            /** Format: uri */
                            primaryImageUrl: string;
                        }[];
                        /** Format: uuid */
                        addressId: string;
                        shippingQuoteId: string;
                        /** @enum {string} */
                        paymentMethodType: "gcash" | "brankas";
                        /** @enum {string} */
                        serviceType: "motorcycle" | "sedan";
                    };
                };
            };
            responses: {
                /** @description Create new order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                orderId: string;
                                /** Format: uuid */
                                paymentId: string;
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
    "/order/{id}": {
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
                /** @description Get order details */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                /** @enum {string} */
                                status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled";
                                /** @enum {string} */
                                serviceType: "motorcycle" | "sedan";
                                items: {
                                    /** Format: uuid */
                                    orderId: string;
                                    /** Format: uuid */
                                    id: string;
                                    /** Format: uuid */
                                    productId: string | null;
                                    /** Format: uuid */
                                    productVariantId: string | null;
                                    quantity: number;
                                    cardMessages: string[];
                                    name: string;
                                    collection: string | null;
                                    category: string;
                                    /** Format: uri */
                                    primaryImageUrl: string;
                                    variantAttributes: {
                                        [key: string]: string;
                                    };
                                    priceCents: number;
                                }[];
                                subtotalCents: number;
                                discountCents: number;
                                shippingCents: number;
                                passOnFee: number;
                                totalCents: number;
                                address: {
                                    fullName: string;
                                    region: string;
                                    city: string;
                                    province?: string | null;
                                    postalCode: string;
                                    barangay: string;
                                    addressLine: string;
                                    phoneNumber: string;
                                };
                                /** Format: date-time */
                                createdAt: string | null;
                                /** Format: date-time */
                                expiresAt: string;
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
                /** @description Order not found */
                404: {
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
    "/order/{id}/pay": {
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
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: uuid */
                        paymentId: string;
                        billing: {
                            name: string;
                            /** Format: email */
                            email: string;
                        };
                        /** @enum {string} */
                        type: "gcash" | "brankas";
                        /** Format: uuid */
                        checkoutSessionId: string;
                    };
                };
            };
            responses: {
                /** @description Pay order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                paymentId: string;
                                /** Format: uri */
                                paymentUrl: string | null;
                                /** @enum {string} */
                                status: "processing" | "pending" | "paid" | "failed" | "cancelled" | "refunded";
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
                /** @description Order not found */
                404: {
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
    "/order/payment/{id}/status": {
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
                /** @description Get order payment status */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** @enum {string} */
                                status: "processing" | "pending" | "paid" | "failed" | "cancelled" | "refunded";
                                /** Format: date-time */
                                expiresAt: string;
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
                /** @description Payment not found */
                404: {
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
