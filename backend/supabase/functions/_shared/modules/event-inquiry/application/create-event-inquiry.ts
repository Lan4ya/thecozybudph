import { CreateEventInquiryInput } from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { EventInquiryRepository } from "../event-inquiry-repository.ts";

export const createEventInquiry = async (
  db: DrizzleClient,
  payload: CreateEventInquiryInput,
  profileId?: string,
) => {
  return await EventInquiryRepository.create(db, {
    ...payload,
    phone: payload.phone || "",
    profileId: profileId || null,
    guestCount: payload.guestCount ? Number(payload.guestCount) : null,
    eventDate: new Date(payload.eventDate),
  });
};
