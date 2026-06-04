import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EventAPI } from "@/api/event";
import type {
  CreateEventInquiryInput,
  QueryEventInquiriesParams,
  UpdateEventInquiryInput,
} from "@cozybud/schemas";

export const useEventInquiries = (params: QueryEventInquiriesParams) => {
  return useQuery({
    queryKey: ["my-event-inquiries", params],
    queryFn: () => EventAPI.getMyInquiries(params),
  });
};

export const useAdminEventInquiries = (params: QueryEventInquiriesParams) => {
  return useQuery({
    queryKey: ["admin-event-inquiries", params],
    queryFn: () => EventAPI.getAdminInquiries(params),
  });
};

export const useEventInquiryMutations = () => {
  const queryClient = useQueryClient();

  const createInquiry = useMutation({
    mutationFn: (payload: CreateEventInquiryInput) =>
      EventAPI.createInquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-inquiries"] });
    },
  });

  const updateInquiry = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventInquiryInput;
    }) => EventAPI.updateInquiry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["my-event-inquiries"] });
    },
  });

  return { createInquiry, updateInquiry };
};
