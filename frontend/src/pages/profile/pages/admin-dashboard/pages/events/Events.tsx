import { useState } from "react";
import {
  useAdminEventInquiries,
  useEventInquiryMutations,
} from "@/hooks/useEventInquiries";
import { useToast } from "@/providers/ToastProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/__shadcn__/select";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Badge } from "@/lib/ui/__shadcn__/badge";
import { format } from "date-fns";
import {
  EVENT_INQUIRY_STATUSES,
  type EventInquiryData,
  type EventInquiryStatus,
} from "@cozybud/schemas";
import {
  Loader2,
  MessageSquare,
  Users,
  MapPin,
  Sparkles,
  Search,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/lib/ui/__shadcn__/sheet";
import { Label } from "@/lib/ui/__shadcn__/label";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/lib/ui/__shadcn__/input";

const EventsAdmin = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] =
    useState<EventInquiryData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const { addToast } = useToast();

  const { data: response, isLoading } = useAdminEventInquiries({
    status:
      statusFilter === "all" ? undefined : (statusFilter as EventInquiryStatus),
    limit: 50,
    offset: 0,
  });

  const { updateInquiry } = useEventInquiryMutations();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateInquiry.mutateAsync({
        id,
        payload: { status: newStatus as EventInquiryStatus },
      });
      addToast("Status updated successfully", "success");
      // Update local state if it's the selected one
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status: newStatus as EventInquiryStatus } : null,
        );
      }
    } catch (error) {
      addToast("Failed to update status", "error");
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedInquiry) return;
    try {
      await updateInquiry.mutateAsync({
        id: selectedInquiry.id,
        payload: { adminNote },
      });
      addToast("Note updated successfully", "success");
    } catch (error) {
      addToast("Failed to update note", "error");
    }
  };

  const inquiries = response || [];

  const filteredInquiries = inquiries.filter((inquiry) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      inquiry.name.toLowerCase().includes(searchLower) ||
      inquiry.email.toLowerCase().includes(searchLower) ||
      inquiry.eventType.toLowerCase().includes(searchLower)
    );
  });

  const getStatusInfo = (status: EventInquiryStatus | string) => {
    switch (status) {
      case "new":
        return {
          label: "New",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "contacted":
        return {
          label: "Contacted",
          className: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "quoted":
        return {
          label: "Quoted",
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "closed":
        return {
          label: "Closed",
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const info = getStatusInfo(status);
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap border",
          info.className,
        )}
      >
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden lg:block">
          <h1 className="text-header font-bold tracking-tight text-primary">
            Event Inquiries
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and respond to customer requests for special event
            arrangements.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative w-full sm:w-auto sm:max-w-80">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inquiries..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {EVENT_INQUIRY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inquiries...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full lg:table-fixed text-sm">
              <thead>
                <tr>
                  <th className="pr-4 pl-8 py-3 text-left font-medium text-muted-foreground">
                    INQUIRY
                  </th>
                  <th className="w-[24%] px-4 py-3 text-left font-medium text-muted-foreground">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    EVENT
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    CREATED
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="size-8 opacity-20 mx-auto" />
                        <p>No inquiries match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => {
                    return (
                      <tr
                        key={inquiry.id}
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setAdminNote(inquiry.adminNote || "");
                          setIsSheetOpen(true);
                        }}
                        className={cn(
                          "cursor-pointer border-t transition-colors hover:bg-accent/15",
                          selectedInquiry?.id === inquiry.id
                            ? "bg-accent/25"
                            : "",
                        )}
                      >
                        <td className="pr-4 pl-8 py-3 text-left">
                          <div className="font-mono text-xs text-primary">
                            {inquiry.id.slice(0, 8)}...
                          </div>
                          {inquiry.profileId && (
                            <div className="text-[10px] text-muted-foreground">
                              USER: {inquiry.profileId.slice(0, 8)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="truncate font-medium">
                            {inquiry.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {inquiry.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <StatusBadge status={inquiry.status} />
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="capitalize font-medium text-xs">
                            {inquiry.eventType}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(inquiry.eventDate, "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left whitespace-nowrap text-xs text-muted-foreground">
                          {format(inquiry.createdAt, "MMM d, yyyy HH:mm")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedInquiry && (
            <>
              <SheetHeader className="pb-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={cn(
                      "font-medium",
                      getStatusInfo(selectedInquiry.status).className,
                    )}
                  >
                    {getStatusInfo(selectedInquiry.status).label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ID: {selectedInquiry.id}
                  </span>
                </div>
                <SheetTitle className="text-2xl">Inquiry Details</SheetTitle>
                <SheetDescription>
                  Submitted by {selectedInquiry.name} on{" "}
                  {format(selectedInquiry.createdAt, "PPP p")}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-8 py-8">
                {/* Contact & Basics */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Email Address
                    </p>
                    <p className="text-sm font-medium underline underline-offset-4 decoration-primary/30">
                      {selectedInquiry.email}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="text-sm font-medium">
                      {selectedInquiry.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Event Type
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {selectedInquiry.eventType}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Event Date
                    </p>
                    <p className="text-sm font-medium">
                      {format(selectedInquiry.eventDate, "PPP")}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Users className="size-3" /> Guest Count
                    </p>
                    <p className="text-sm font-medium">
                      {selectedInquiry.guestCount || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3" /> Budget
                    </p>
                    <p className="text-sm font-medium">
                      {selectedInquiry.budget || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" /> Venue
                    </p>
                    <p className="text-sm font-medium italic">
                      {selectedInquiry.venue || "No venue specified"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="size-3" /> Message
                  </p>
                  <div className="bg-background p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                <Separator />

                {/* Management Section */}
                <div className="space-y-6 bg-accent/5 p-6 rounded-2xl border border-border/50">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                    Management
                  </h3>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">
                      Change Status
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_INQUIRY_STATUSES.map((status) => (
                        <Button
                          key={status}
                          variant={
                            selectedInquiry.status === status
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="capitalize text-xs h-8"
                          onClick={() =>
                            handleUpdateStatus(selectedInquiry.id, status)
                          }
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">
                      Private Admin Notes
                    </Label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add internal notes about communication, pricing, etc..."
                      rows={5}
                      className="text-sm resize-none"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleUpdateNote}
                      disabled={updateInquiry.isPending}
                    >
                      {updateInquiry.isPending ? (
                        <>
                          <Loader2 className="size-3 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Notes"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EventsAdmin;
