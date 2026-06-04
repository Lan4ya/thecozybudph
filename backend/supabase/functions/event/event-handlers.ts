import { RouteHandler } from "@hono/zod-openapi";
import { EventInquiryActions } from "@shared/modules/event-inquiry/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";
import { EventInquiryData, SelectEventInquiry } from "@shared/schemas/index.ts";
import {
  createEventInquiryRoute,
  getAdminEventInquiryRoute,
  queryAdminEventInquiriesRoute,
  queryUserEventInquiriesRoute,
  updateEventInquiryRoute,
} from "./event-routes.ts";
import { AppError } from "@shared/errors/Errors.ts";

const mapEventInquiry = (inquiry: SelectEventInquiry): EventInquiryData => ({
  id: inquiry.id,
  profileId: inquiry.profileId,
  name: inquiry.name,
  email: inquiry.email,
  phone: inquiry.phone,
  eventType: inquiry.eventType,
  eventDate: inquiry.eventDate.toISOString(),
  guestCount: inquiry.guestCount ?? undefined,
  venue: inquiry.venue ?? undefined,
  budget: inquiry.budget ?? undefined,
  message: inquiry.message,
  status: inquiry.status,
  adminNote: inquiry.adminNote,
  createdAt: (inquiry.createdAt ?? new Date()).toISOString(),
  updatedAt: (inquiry.updatedAt ?? new Date()).toISOString(),
});

export const createEventInquiryHandler: RouteHandler<
  typeof createEventInquiryRoute,
  AppEnv
> = async (c) => {
  const { db, supabase } = requireVariables(c, "db", "supabase");
  let profileId: string | undefined;
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data } = await supabase.auth.getClaims(token);
    if (data?.claims?.sub) {
      profileId = data.claims.sub;
    }
  }
  const payload = c.req.valid("json");
  const data = await EventInquiryActions.createEventInquiry(
    db,
    payload,
    profileId,
  );
  return c.json({ data: mapEventInquiry(data) }, 200);
};

export const queryUserEventInquiriesHandler: RouteHandler<
  typeof queryUserEventInquiriesRoute,
  AppEnv
> = async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const query = c.req.valid("query");
  const data = await EventInquiryActions.queryEventInquiries(db, {
    ...query,
    profileId,
  });
  return c.json({ data: data.map(mapEventInquiry) }, 200);
};

export const queryAdminEventInquiriesHandler: RouteHandler<
  typeof queryAdminEventInquiriesRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const query = c.req.valid("query");
  const data = await EventInquiryActions.queryEventInquiries(db, query);
  return c.json({ data: data.map(mapEventInquiry) }, 200);
};

export const updateEventInquiryHandler: RouteHandler<
  typeof updateEventInquiryRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");
  const data = await EventInquiryActions.updateEventInquiry(db, id, payload);
  return c.json({ data: mapEventInquiry(data) }, 200);
};

export const getAdminEventInquiryHandler: RouteHandler<
  typeof getAdminEventInquiryRoute,
  AppEnv
> = async (c) => {
  const { db } = requireVariables(c, "db");
  const { id } = c.req.valid("param");
  const data = await EventInquiryActions.getEventInquiryById(db, id);
  if (!data) {
    throw AppError.notFound({ message: "Inquiry not found" });
  }
  return c.json({ data: mapEventInquiry(data) }, 200);
};
