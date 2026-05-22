export interface paths {
    "/admin/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled" | "paid" | "shipped" | "expired";
                    sortBy?: "createdAt" | "updatedAt" | "totalCents";
                    sortDir?: "asc" | "desc";
                    limit?: number;
                    offset?: number;
                    search?: string;
                    dateFrom?: string;
                    dateTo?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get admin orders */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                orders: {
                                    /** Format: uuid */
                                    id: string;
                                    /** Format: uuid */
                                    profileId: string;
                                    /** @enum {string} */
                                    status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled" | "paid" | "shipped" | "expired";
                                    subtotalCents: number;
                                    discountCents: number;
                                    passOnFee: number;
                                    shippingCents: number;
                                    totalCents: number;
                                    /** Format: date-time */
                                    createdAt: string;
                                    /** Format: date-time */
                                    updatedAt: string;
                                    /** Format: date-time */
                                    expiresAt: string;
                                    items: {
                                        /** Format: uuid */
                                        orderId: string;
                                        name: string;
                                        /** Format: uri */
                                        image: string | null;
                                        attributes: {
                                            [key: string]: string;
                                        };
                                        quantity: number;
                                        cardMessages: string[];
                                        priceCents: number;
                                        category: string | null;
                                        collection: string | null;
                                    }[];
                                    address: {
                                        name: string;
                                        phone: string;
                                        postalCode: string;
                                        region: string;
                                        province: string | null;
                                        city: string;
                                        barangay: string;
                                        addressLine: string;
                                    };
                                }[];
                                meta: {
                                    total: number;
                                    limit: number;
                                    offset: number;
                                };
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
    "/admin/product": {
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
                    "multipart/form-data": {
                        name: string;
                        description?: string;
                        categoryName: string;
                        collectionName?: string;
                        productImages: File[];
                        primaryImageIndex: number | null;
                        options: {
                            name: string;
                            values: string[];
                        }[];
                        variants: {
                            /** Format: uuid */
                            id?: string;
                            priceCents: number;
                            attributes: {
                                [key: string]: string;
                            };
                        }[];
                    };
                };
            };
            responses: {
                /** @description Create product */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                description: string | null;
                                imageUrls: string[];
                                /** Format: uri */
                                primaryImageUrl: string;
                                minPriceCents: number;
                                maxPriceCents: number;
                                options: {
                                    name: string;
                                    values: string[];
                                }[];
                                variants: {
                                    /** Format: uuid */
                                    id: string;
                                    priceCents: number;
                                    attributes: {
                                        [key: string]: string;
                                    };
                                }[];
                                categoryName: string | null;
                                collectionName: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
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
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        productIds: string[];
                    };
                };
            };
            responses: {
                /** @description Delete products */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                deletedProductIds: string[];
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/product/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
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
                    "multipart/form-data": {
                        name?: string;
                        description?: string;
                        categoryName?: string;
                        collectionName?: string;
                        /** @default [] */
                        newProductImages?: File[] | null;
                        imageUrlsToDelete?: string[];
                        primaryImageIndex?: number | null;
                        options?: {
                            name: string;
                            values: string[];
                        }[];
                        /** @default [] */
                        variants?: {
                            /** Format: uuid */
                            id?: string;
                            priceCents: number;
                            attributes: {
                                [key: string]: string;
                            };
                        }[];
                    };
                };
            };
            responses: {
                /** @description Update product */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                description: string | null;
                                imageUrls: string[];
                                /** Format: uri */
                                primaryImageUrl: string;
                                minPriceCents: number;
                                maxPriceCents: number;
                                options: {
                                    name: string;
                                    values: string[];
                                }[];
                                variants: {
                                    /** Format: uuid */
                                    id: string;
                                    priceCents: number;
                                    attributes: {
                                        [key: string]: string;
                                    };
                                }[];
                                categoryName: string | null;
                                collectionName: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
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
