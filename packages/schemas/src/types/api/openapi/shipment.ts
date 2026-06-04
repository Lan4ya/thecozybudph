export interface paths {
  "/shipment/order/{id}/shipment": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
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
        /** @description Cancel ship order */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                /** Format: uuid */
                orderId: string;
                /** @enum {string} */
                status:
                  | "toPay"
                  | "toShip"
                  | "toReceive"
                  | "fulfilled"
                  | "cancelled"
                  | "paid"
                  | "shipped"
                  | "expired";
                shipmentStatus: string;
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
            sender: {
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
            };
            recipient: {
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
              remarks?: string;
            };
            /** @enum {string} */
            serviceType: "motorcycle" | "sedan";
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
                shippingOrderId?: string;
                /** @enum {string} */
                status:
                  | "toPay"
                  | "toShip"
                  | "toReceive"
                  | "fulfilled"
                  | "cancelled"
                  | "paid"
                  | "shipped"
                  | "expired";
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
                id: string;
                quotationId: string;
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
                driverId?: string | null;
                /** Format: uri */
                shareLink?: string;
                status: string;
                distance?: {
                  value: string;
                  unit: string;
                };
                stops: {
                  /** Format: uuid */
                  id?: string;
                  coordinates: {
                    lat: string;
                    lng: string;
                  };
                  address: string;
                  name: string;
                  phone: string;
                  remarks?: string;
                  POD?: {
                    [key: string]: unknown;
                  };
                }[];
                metadata?: {
                  [key: string]: unknown;
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
  "/shipment/order/priority-fee": {
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
            orderId: string;
            fee: string;
          };
        };
      };
      responses: {
        /** @description Add priority fee */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                id: string;
                quotationId: string;
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
                driverId?: string | null;
                /** Format: uri */
                shareLink?: string;
                status: string;
                distance?: {
                  value: string;
                  unit: string;
                };
                stops: {
                  /** Format: uuid */
                  id?: string;
                  coordinates: {
                    lat: string;
                    lng: string;
                  };
                  address: string;
                  name: string;
                  phone: string;
                  remarks?: string;
                  POD?: {
                    [key: string]: unknown;
                  };
                }[];
                metadata?: {
                  [key: string]: unknown;
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
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shipment/driver": {
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
                name?: string;
                phone?: string;
                plateNumber?: string;
                /** Format: uri */
                photo?: string;
                coordinates?: {
                  lat: string;
                  lng: string;
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
  "/shipment/driver/change": {
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
            driverId: string;
            orderId: string;
            reason: string;
          };
        };
      };
      responses: {
        /** @description Change shipping driver */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                id: string;
                name?: string;
                phone?: string;
                plateNumber?: string;
                /** Format: uri */
                photo?: string;
                coordinates?: {
                  lat: string;
                  lng: string;
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
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shipment/city/{cityId}": {
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
          cityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Get shipping city */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                id: string;
                name: string;
                status?: string;
              };
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
  "/shipment/market": {
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
        /** @description Get shipping market */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                id: string;
                name?: string;
                cities: {
                  id: string;
                  name: string;
                  status?: string;
                }[];
              };
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
  "/shipment/order/edit": {
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
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": {
            orderId: string;
            stops: {
              coordinates?: {
                lat: string;
                lng: string;
              };
              address: string;
              name?: string;
              phone?: string;
              remarks?: string;
            }[];
          };
        };
      };
      responses: {
        /** @description Edit shipping order */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              data: {
                id: string;
                quotationId: string;
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
                driverId?: string | null;
                /** Format: uri */
                shareLink?: string;
                status: string;
                distance?: {
                  value: string;
                  unit: string;
                };
                stops: {
                  /** Format: uuid */
                  id?: string;
                  coordinates: {
                    lat: string;
                    lng: string;
                  };
                  address: string;
                  name: string;
                  phone: string;
                  remarks?: string;
                  POD?: {
                    [key: string]: unknown;
                  };
                }[];
                metadata?: {
                  [key: string]: unknown;
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
