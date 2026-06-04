export interface paths {
    "/admin/analytics": {
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
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get admin analytics */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                keyMetrics: {
                                    totalRevenue: {
                                        value: string;
                                        change: string;
                                        positive: boolean;
                                    };
                                    totalOrders: {
                                        value: string;
                                        change: string;
                                        positive: boolean;
                                    };
                                    totalCustomers: {
                                        value: string;
                                        change: string;
                                        positive: boolean;
                                    };
                                    conversionRate: {
                                        value: string;
                                        change: string;
                                        positive: boolean;
                                    };
                                };
                                revenueTrend: {
                                    date: string;
                                    revenue: number;
                                    orders: number;
                                }[];
                                categorySales: {
                                    name: string;
                                    value: number;
                                    color: string;
                                }[];
                                topProducts: {
                                    name: string;
                                    sales: number;
                                    revenue: number;
                                }[];
                                dailyOrders: {
                                    date: string;
                                    orders: number;
                                }[];
                                customerAcquisition: {
                                    month: string;
                                    customers: number;
                                }[];
                                recentTransactions: {
                                    id: string;
                                    customer: string;
                                    amount: string;
                                    status: string;
                                    date: string;
                                }[];
                                productPerformance: {
                                    name: string;
                                    views: number;
                                    clicks: number;
                                    conversions: number;
                                    revenue: string;
                                }[];
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
                                    /** @enum {string} */
                                    serviceType: "motorcycle" | "sedan";
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
    "/admin/order/{id}": {
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
                /** @description Get admin dashboard order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string;
                                /** @enum {string} */
                                status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled" | "paid" | "shipped" | "expired";
                                /** @enum {string} */
                                serviceType: "motorcycle" | "sedan";
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
                            } | null;
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
                /** @description Not found */
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
                        description?: string | null;
                        categoryName: string;
                        collectionName?: string | null;
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
                        description?: string | null;
                        categoryName?: string;
                        collectionName?: string | null;
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
    "/admin/order/{id}/ship": {
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
                /** @description Get shipment (lalamove) order details */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                orderId: string;
                                lalamoveOrderId: string | null;
                                lalamoveQuotationId: string | null;
                                /** Format: date-time */
                                scheduleAt: string | null;
                                /** @enum {string|null} */
                                shipmentStatus: "ASSIGNING_DRIVER" | "ON_GOING" | "PICKED_UP" | "COMPLETED" | "CANCELLED" | "REJECTED" | "EXPIRED" | null;
                                shareLink: string | null;
                                totalCents: number | null;
                                PODImageUrl: string | null;
                                /** @enum {string|null} */
                                PODStatus: "FAILED" | "SIGNED" | "DELIVERED" | null;
                                /** Format: date-time */
                                PODFailedAt: string | null;
                                /** Format: date-time */
                                PODDeliveredAt: string | null;
                                driverId: string | null;
                                driverName: string | null;
                                driverPhone: string | null;
                                driverImageUrl: string | null;
                                /** Format: uri */
                                driverShareLink: string | null;
                                driverLocation: string | null;
                                driverPlateNumber: string | null;
                                cancelParty: string | null;
                                cancelReason: string | null;
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
        put?: never;
        post?: never;
        delete: {
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
                /** @description Cancel shipment (lalmove) order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                success: boolean;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
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
                    "application/json": {
                        remarks?: string;
                    };
                };
            };
            responses: {
                /** @description Ship order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                /** Format: uuid */
                                orderId: string;
                                lalamoveOrderId: string | null;
                                lalamoveQuotationId: string | null;
                                /** Format: date-time */
                                scheduleAt: string | null;
                                /** @enum {string|null} */
                                shipmentStatus: "ASSIGNING_DRIVER" | "ON_GOING" | "PICKED_UP" | "COMPLETED" | "CANCELLED" | "REJECTED" | "EXPIRED" | null;
                                shareLink: string | null;
                                totalCents: number | null;
                                PODImageUrl: string | null;
                                /** @enum {string|null} */
                                PODStatus: "FAILED" | "SIGNED" | "DELIVERED" | null;
                                /** Format: date-time */
                                PODFailedAt: string | null;
                                /** Format: date-time */
                                PODDeliveredAt: string | null;
                                driverId: string | null;
                                driverName: string | null;
                                driverPhone: string | null;
                                driverImageUrl: string | null;
                                /** Format: uri */
                                driverShareLink: string | null;
                                driverLocation: string | null;
                                driverPlateNumber: string | null;
                                cancelParty: string | null;
                                cancelReason: string | null;
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
    "/admin/shipment/quotes": {
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
                        /** Format: uuid */
                        recipientAddressId: string;
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
    "/admin/shipment/driver": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    driverId: string;
                    orderId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get shipping driver */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                id: string;
                                contact: {
                                    name: string;
                                    phone: string;
                                };
                                plateNumber: string;
                                /** Format: uri */
                                photo: string;
                                coordinates: {
                                    lat: string;
                                    lng: string;
                                };
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
    "/admin/shipment/webhook": {
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
            requestBody?: never;
            responses: {
                /** @description Handle shipment webhook */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                success: boolean;
                            };
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
