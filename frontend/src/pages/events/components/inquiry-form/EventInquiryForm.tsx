import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventInquiryFormSchema,
  type EventInquiryFormInput,
} from "@cozybud/schemas";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Label } from "@/lib/ui/__shadcn__/label";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { EVENT_TYPES, BUDGET_RANGES } from "@/pages/events/constants";

export interface EventInquiryFormProps {
  onSubmit: (data: EventInquiryFormInput) => void;
  isSubmitting?: boolean;
}

export const EventInquiryForm = ({
  onSubmit,
  isSubmitting = false,
}: EventInquiryFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventInquiryFormInput>({
    resolver: zodResolver(eventInquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      guestCount: "" as unknown as undefined,
      venue: "",
      budget: "",
      message: "",
    },
  });

  const selectClasses =
    "flex h-10 w-full rounded-md border border-input bg-popover px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Email Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground/80">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Your full name"
            className={cn(
              "bg-popover border-border/60",
              errors.name && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/80">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="your@email.com"
            className={cn(
              "bg-popover border-border/60",
              errors.email && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Phone & Event Type Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground/80">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+639XXXXXXXXX"
            className={cn(
              "bg-popover border-border/60",
              errors.phone && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventType" className="text-foreground/80">
            Event Type <span className="text-red-500">*</span>
          </Label>
          <select
            id="eventType"
            {...register("eventType")}
            className={cn(
              selectClasses,
              errors.eventType && "border-red-500 focus-visible:ring-red-500",
            )}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p className="text-xs text-red-500">{errors.eventType.message}</p>
          )}
        </div>
      </div>

      {/* Event Date & Guest Count Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate" className="text-foreground/80">
            Event Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="eventDate"
            type="date"
            {...register("eventDate")}
            min={new Date().toISOString().split("T")[0]}
            className={cn(
              "bg-popover border-border/60",
              errors.eventDate && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.eventDate && (
            <p className="text-xs text-red-500">{errors.eventDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestCount" className="text-foreground/80">
            Number of Guests
          </Label>
          <Input
            id="guestCount"
            type="number"
            {...register("guestCount", { valueAsNumber: true })}
            placeholder="Approximate number of guests"
            className={cn(
              "bg-popover border-border/60",
              errors.guestCount && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.guestCount && (
            <p className="text-xs text-red-500">{errors.guestCount.message}</p>
          )}
        </div>
      </div>

      {/* Venue & Budget Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue" className="text-foreground/80">
            Event Venue
          </Label>
          <Input
            id="venue"
            {...register("venue")}
            placeholder="Where will the event be held?"
            className={cn(
              "bg-popover border-border/60",
              errors.venue && "border-red-500 focus-visible:ring-red-500",
            )}
          />
          {errors.venue && (
            <p className="text-xs text-red-500">{errors.venue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-foreground/80">
            Budget Range
          </Label>
          <select id="budget" {...register("budget")} className={selectClasses}>
            {BUDGET_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground/80">
          Tell Us About Your Event <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Describe your vision, color preferences, flower types you love, and any special requests..."
          rows={5}
          className={cn(
            "bg-popover border-border/60 resize-none",
            errors.message && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending Inquiry...
          </span>
        ) : (
          "Send Event Inquiry"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We&apos;ll get back to you within 24-48 hours with a customized
        proposal.
      </p>
    </form>
  );
};
