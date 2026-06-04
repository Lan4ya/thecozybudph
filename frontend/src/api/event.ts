import { client, unwrapData } from "./_client";
import type {
  CreateEventInquiryInput,
  QueryEventInquiriesParams,
  UpdateEventInquiryInput,
  EventInquiryData,
} from "@cozybud/schemas";

const mapInquiryDates = (inquiry: any): EventInquiryData => ({
  ...inquiry,
  eventDate: new Date(inquiry.eventDate),
  createdAt: new Date(inquiry.createdAt),
  updatedAt: new Date(inquiry.updatedAt),
});

export const EventAPI = {
  createInquiry: async (
    payload: CreateEventInquiryInput,
  ): Promise<EventInquiryData> => {
    const { data } = await client.event.POST("/event/inquiry", {
      body: payload,
    });
    const unwrapped = unwrapData(data, "EventAPI.createInquiry");
    return mapInquiryDates(unwrapped);
  },

  getMyInquiries: async (
    params: QueryEventInquiriesParams,
  ): Promise<EventInquiryData[]> => {
    const { data } = await client.event.GET("/event/inquiry", {
      params: { query: params },
    });
    const unwrapped = unwrapData(data, "EventAPI.getMyInquiries");
    return unwrapped.map(mapInquiryDates);
  },

  getAdminInquiries: async (
    params: QueryEventInquiriesParams,
  ): Promise<EventInquiryData[]> => {
    const { data } = await client.event.GET("/event/inquiry/admin", {
      params: { query: params },
    });
    const unwrapped = unwrapData(data, "EventAPI.getAdminInquiries");
    return unwrapped.map(mapInquiryDates);
  },

  getAdminInquiry: async (id: string): Promise<EventInquiryData> => {
    const { data } = await client.event.GET("/event/inquiry/admin/{id}", {
      params: { path: { id } },
    });
    const unwrapped = unwrapData(data, "EventAPI.getAdminInquiry");
    return mapInquiryDates(unwrapped);
  },

  updateInquiry: async (
    id: string,
    payload: UpdateEventInquiryInput,
  ): Promise<EventInquiryData> => {
    const { data } = await client.event.PATCH("/event/inquiry/{id}", {
      params: { path: { id } },
      body: payload,
    });
    const unwrapped = unwrapData(data, "EventAPI.updateInquiry");
    return mapInquiryDates(unwrapped);
  },
};
