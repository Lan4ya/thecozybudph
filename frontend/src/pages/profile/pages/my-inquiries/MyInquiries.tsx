import { useEventInquiries } from "@/hooks/useEventInquiries";
import { format } from "date-fns";
import { Badge } from "@/lib/ui/__shadcn__/badge";
import {
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Info,
  ChevronRight,
  History,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/ui/__shadcn__/card";
import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/lib/ui/__shadcn__/sheet";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import {
  type EventInquiryData,
  EVENT_INQUIRY_STATUSES,
} from "@cozybud/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";
import { MetaBadge } from "@/components/MetaBadge";

const STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "quoted", label: "Quoted" },
  { status: "closed", label: "Closed" },
] as const;

const MyInquiries = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { data: response, isLoading } = useEventInquiries({
    status: activeTab === "all" ? undefined : (activeTab as any),
    limit: 50,
  });

  const [selectedInquiry, setSelectedInquiry] =
    useState<EventInquiryData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const inquiries = response || [];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "new":
        return {
          label: "New Request",
          color: "text-blue-600 bg-blue-50 border-blue-200",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          description: "We've received your request and will review it soon.",
        };
      case "contacted":
        return {
          label: "Contacted",
          color: "text-amber-600 bg-amber-50 border-amber-200",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          description:
            "Our team has reached out to discuss your event details.",
        };
      case "quoted":
        return {
          label: "Quoted",
          color: "text-indigo-600 bg-indigo-50 border-indigo-200",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
          description: "We've sent you a proposal for your event.",
        };
      case "closed":
        return {
          label: "Closed",
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          description: "This inquiry has been finalized.",
        };
      default:
        return {
          label: status,
          color: "text-gray-600 bg-gray-50 border-gray-200",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          description: "",
        };
    }
  };

  const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("wedding")) return <Sparkles className="size-4" />;
    if (t.includes("party") || t.includes("birthday"))
      return <PartyPopper className="size-4" />;
    return <Calendar className="size-4" />;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      {/* Header - Matching MyPurchases */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-header tracking-tight text-foreground md:text-4xl">
            Event Inquiries
          </h1>
          <p className="text-muted-foreground font-medium">
            View and track the status of your special event requests
          </p>
        </div>
      </div>

      {/* Tabs - Matching MyPurchases */}
      <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-md border-b md:relative md:top-auto md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none">
        <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div
            className="flex min-w-max gap-2 rounded-xl p-2 md:py-0 md:px-0.5 bg-primary/10 md:bg-transparent md:gap-3"
            role="tablist"
          >
            {STATUS_TABS.map(({ status, label }, idx) => (
              <button
                key={`status-${idx}`}
                type="button"
                role="tab"
                aria-selected={activeTab === status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === status
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/20 md:hover:bg-transparent md:hover:underline md:underline-offset-8 md:decoration-2",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-center h-108">
          <FlowerSpinner />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-primary/2 py-18 lg:py-24 text-center">
          <div className="mx-auto size-18 lg:size-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <History className="text-primary/40 size-8 lg:size-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-primary">
            No inquiries yet
          </h3>
          <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
            {activeTab === "all"
              ? "You haven't submitted any event inquiries yet."
              : `You don't have any "${activeTab}" inquiries yet.`}
          </p>
          <Button asChild className="rounded-full px-6!">
            <a href="/events#inquiry-form">
              Explore Events <ArrowRight />
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {inquiries.map((inquiry, index) => {
              const statusInfo = getStatusInfo(inquiry.status);
              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setIsSheetOpen(true);
                  }}
                  className="group block cursor-pointer"
                >
                  <div className="flex flex-col h-full rounded-3xl border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/30">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/80">
                        {getEventIcon(inquiry.eventType)}
                        <span className="truncate">{inquiry.eventType}</span>
                      </div>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                          statusInfo.badge,
                        )}
                      >
                        <Info className="h-3 w-3" />
                        {inquiry.status}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm line-clamp-2 leading-tight capitalize">
                          {inquiry.eventType} Arrangement
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          {format(inquiry.eventDate, "MMMM d, yyyy")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {inquiry.guestCount && (
                          <MetaBadge
                            label="Guests"
                            value={String(inquiry.guestCount)}
                            className="px-1.5 py-0 text-[9px]"
                          />
                        )}
                        {inquiry.budget && (
                          <MetaBadge
                            label="Budget"
                            value={inquiry.budget}
                            className="px-1.5 py-0 text-[9px]"
                          />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 italic border-l-2 border-primary/10 pl-3">
                        &quot;{inquiry.message}&quot;
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 bg-primary/2 text-[10px] font-bold text-primary/70 uppercase tracking-widest border-t border-primary/5 group-hover:bg-primary/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] opacity-40">
                          #{inquiry.id.slice(0, 8)}
                        </span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto p-0 border-l-0">
          {selectedInquiry && (
            <div className="flex flex-col h-full">
              {/* Premium Status Header - Matching OrderDetails */}
              <div
                className={cn(
                  "p-8 border-b",
                  getStatusInfo(selectedInquiry.status).color,
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
                  <Info className="h-3.5 w-3.5" />
                  {selectedInquiry.status}
                </div>
                <h1 className="text-2xl font-bold tracking-tight leading-snug">
                  Inquiry #{selectedInquiry.id.slice(-6).toUpperCase()}
                </h1>
                <p className="mt-2 text-sm opacity-85 leading-relaxed max-w-sm">
                  {getStatusInfo(selectedInquiry.status).description}
                </p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Submitted {format(selectedInquiry.createdAt, "PPP p")}
                </div>
              </div>

              <div className="flex-1 px-8 py-8 space-y-8">
                {/* Information Grid */}
                <div className="grid gap-8 lg:grid-cols-2">
                  <section className="space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      Event Details
                    </h2>
                    <div className="rounded-2xl border bg-card p-5 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Type
                        </p>
                        <p className="text-sm font-semibold capitalize">
                          {selectedInquiry.eventType}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Date
                        </p>
                        <p className="text-sm font-semibold">
                          {format(selectedInquiry.eventDate, "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-6 pt-2 border-t border-border/50">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Guests
                          </p>
                          <p className="text-sm font-semibold">
                            {selectedInquiry.guestCount || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Budget
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {selectedInquiry.budget || "Flexible"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Location
                    </h2>
                    <div className="rounded-2xl border bg-card p-5 h-full">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Venue
                      </p>
                      <p className="text-sm font-semibold leading-relaxed italic">
                        {selectedInquiry.venue ||
                          "To be determined during consultation"}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Message Section */}
                <section className="space-y-4">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Your Message
                  </h2>
                  <div className="rounded-2xl border-2 border-primary/10 bg-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
                      &quot;{selectedInquiry.message}&quot;
                    </p>
                  </div>
                </section>

                {/* Next Steps - Styled like OrderDetails Help */}
                <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10 flex gap-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                    <History className="size-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-tight">
                      Consultation Process
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our floral designers are reviewing your request. We'll
                      reach out to <strong>{selectedInquiry.email}</strong>{" "}
                      within 24-48 hours to discuss the next steps and provide a
                      custom proposal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-8 bg-muted/30 border-t flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12 font-bold"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/20"
                  asChild
                >
                  <a href="mailto:thecozybudph@gmail.com">Contact Support</a>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyInquiries;
