import { QueryEventInquiriesParams } from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { EventInquiryRepository } from "../event-inquiry-repository.ts";

export const queryEventInquiries = async (
  db: DrizzleClient,
  params: QueryEventInquiriesParams & { profileId?: string },
) => {
  return await EventInquiryRepository.query(db, {
    ...params,
    status: params.status as any, // Cast due to potential string vs enum mismatch
  });
};
