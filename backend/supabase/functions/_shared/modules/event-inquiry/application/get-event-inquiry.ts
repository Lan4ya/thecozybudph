import { DrizzleClient } from "../../../db/client.ts";
import { EventInquiryRepository } from "../event-inquiry-repository.ts";

export const getEventInquiryById = async (db: DrizzleClient, id: string) => {
  return await EventInquiryRepository.findById(db, id);
};
