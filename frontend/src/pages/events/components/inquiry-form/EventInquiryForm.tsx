import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventInquiryFormSchema,
  type EventInquiryFormInput,
} from "@cozybud/schemas";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Label } from "@/lib/ui/__shadcn__/label";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/__shadcn__/select";
import { cn } from "@/lib/utils/cn";
import { EVENT_TYPES } from "@/pages/events/constants";
import { DatePicker } from "@/components/DatePicker";

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
    control,
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
      message: "",
    },
  });

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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r pr-2">
              +63
            </span>
            <Input
              id="phone"
              {...register("phone", {
                setValueAs: (value: string) => {
                  if (!value) return "";
                  return `+63${value}`;
                },
              })}
              maxLength={10}
              placeholder="9XXXXXXXXX"
              inputMode="numeric"
              className={cn(
                "pl-14 bg-popover border-border/60",
                errors.phone && "border-red-500 focus-visible:ring-red-500",
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground/80">
            Event Type <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="eventType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={cn(
                    "bg-popover border-border/60 w-full",
                    errors.eventType && "border-red-500 focus:ring-red-500",
                  )}
                >
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {EVENT_TYPES.filter((t) => t.value !== "").map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.eventType && (
            <p className="text-xs text-red-500">{errors.eventType.message}</p>
          )}
        </div>
      </div>

      {/* Event Date & Guest Count Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground/80">
            Event Date <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(date) => field.onChange(date?.toISOString())}
                placeholder="Select event date"
                className={cn(
                  errors.eventDate && "border-red-500 focus:ring-red-500",
                )}
              />
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
            {...register("guestCount")}
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

      {/* Venue Row */}
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
