"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/lib/ui/__shadcn__/calendar";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/lib/ui/__shadcn__/popover";
import { cn } from "@/lib/utils/cn";

export interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    return typeof value === "string" ? new Date(value) : value;
  }, [value]);

  // Anchor the minimum date boundary to January 1st of the current year
  const startOfCurrentYear = React.useMemo(() => {
    return new Date(new Date().getFullYear(), 0, 1);
  }, []);

  // Anchor the maximum date boundary to December 31st of 10 years ahead
  const endOfRangeYear = React.useMemo(() => {
    return new Date(new Date().getFullYear() + 10, 11, 31);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal bg-popover border-border/60 h-10",
            !dateValue && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 opacity-50" />
            {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
          </div>
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          captionLayout="dropdown"
          defaultMonth={dateValue || new Date()}
          startMonth={startOfCurrentYear}
          endMonth={endOfRangeYear}
          disabled={{
            before: new Date(new Date().setHours(0, 0, 0, 0)),
            after: endOfRangeYear,
          }}
          onSelect={(selectedDate) => {
            onChange(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
