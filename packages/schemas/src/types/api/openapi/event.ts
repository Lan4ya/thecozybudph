export interface paths {
    "/event/inquiry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: "new" | "contacted" | "quoted" | "closed";
                    limit?: number;
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Query user's event inquiries */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                name: string;
                                /** Format: email */
                                email: string;
                                phone?: string | "";
                                eventType: string;
                                eventDate: string;
                                guestCount?: number | "";
                                venue?: string | "";
                                budget?: string | "";
                                message: string;
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string | null;
                                /** @enum {string} */
                                status: "new" | "contacted" | "quoted" | "closed";
                                adminNote: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
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
                        name: string;
                        /** Format: email */
                        email: string;
                        phone?: string | "";
                        eventType: string;
                        eventDate: string;
                        guestCount?: number | "";
                        venue?: string | "";
                        budget?: string | "";
                        message: string;
                    };
                };
            };
            responses: {
                /** @description Create new event inquiry */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                name: string;
                                /** Format: email */
                                email: string;
                                phone?: string | "";
                                eventType: string;
                                eventDate: string;
                                guestCount?: number | "";
                                venue?: string | "";
                                budget?: string | "";
                                message: string;
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string | null;
                                /** @enum {string} */
                                status: "new" | "contacted" | "quoted" | "closed";
                                adminNote: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
                            };
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
    "/event/inquiry/admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: "new" | "contacted" | "quoted" | "closed";
                    limit?: number;
                    offset?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Query all event inquiries (Admin) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                name: string;
                                /** Format: email */
                                email: string;
                                phone?: string | "";
                                eventType: string;
                                eventDate: string;
                                guestCount?: number | "";
                                venue?: string | "";
                                budget?: string | "";
                                message: string;
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string | null;
                                /** @enum {string} */
                                status: "new" | "contacted" | "quoted" | "closed";
                                adminNote: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
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
    "/event/inquiry/{id}": {
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
                    "application/json": {
                        /** @enum {string} */
                        status?: "new" | "contacted" | "quoted" | "closed";
                        adminNote?: string;
                    };
                };
            };
            responses: {
                /** @description Update event inquiry (Admin) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                name: string;
                                /** Format: email */
                                email: string;
                                phone?: string | "";
                                eventType: string;
                                eventDate: string;
                                guestCount?: number | "";
                                venue?: string | "";
                                budget?: string | "";
                                message: string;
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string | null;
                                /** @enum {string} */
                                status: "new" | "contacted" | "quoted" | "closed";
                                adminNote: string | null;
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
                /** @description Inquiry not found */
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
        trace?: never;
    };
    "/event/inquiry/admin/{id}": {
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
                /** @description Get single event inquiry (Admin) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: {
                                name: string;
                                /** Format: email */
                                email: string;
                                phone?: string | "";
                                eventType: string;
                                eventDate: string;
                                guestCount?: number | "";
                                venue?: string | "";
                                budget?: string | "";
                                message: string;
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                profileId: string | null;
                                /** @enum {string} */
                                status: "new" | "contacted" | "quoted" | "closed";
                                adminNote: string | null;
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
                /** @description Inquiry not found */
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
