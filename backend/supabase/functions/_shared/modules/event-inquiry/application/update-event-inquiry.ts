import {
  UpdateEventInquiryInput,
  DBEventInquiryStatus,
} from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { EventInquiryRepository } from "../event-inquiry-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const updateEventInquiry = async (
  db: DrizzleClient,
  id: string,
  payload: UpdateEventInquiryInput,
) => {
  const existing = await EventInquiryRepository.getById(db, id);
  if (!existing) {
    throw AppError.notFound({ message: "Event inquiry not found" });
  }

  return await EventInquiryRepository.update(db, id, {
    ...payload,
    status: payload.status as DBEventInquiryStatus | undefined,
  });
};
