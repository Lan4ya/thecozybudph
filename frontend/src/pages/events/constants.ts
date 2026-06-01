import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Sparkles,
  Calendar,
  Palette,
} from "lucide-react";
import { ASSETS } from "@/lib/constants/assets";

export interface EventCategory {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    title: "Weddings",
    description: "Elegant floral arrangements for your special day",
    icon: Heart,
  },
  {
    title: "Corporate Events",
    description: "Professional designs that impress clients and colleagues",
    icon: Sparkles,
  },
  {
    title: "Birthdays",
    description: "Celebratory blooms for milestone moments",
    icon: Calendar,
  },
  {
    title: "Custom Styling",
    description: "Bespoke floral art tailored to your vision",
    icon: Palette,
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { src: ASSETS.EVENT_1, alt: "Wedding floral arrangement" },
  { src: ASSETS.EVENT_2, alt: "Event centerpiece design" },
  { src: ASSETS.EVENT_3, alt: "Elegant bouquet display" },
  { src: ASSETS.EVENT_4, alt: "Floral decoration setup" },
];

export const EVENT_TYPES = [
  { value: "", label: "Select event type" },
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "bridal-shower", label: "Bridal Shower" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "anniversary", label: "Anniversary" },
  { value: "memorial", label: "Memorial Service" },
  { value: "other", label: "Other" },
] as const;

export const BUDGET_RANGES = [
  { value: "", label: "Select budget range (optional)" },
  { value: "under-5k", label: "Under ₱5,000" },
  { value: "5k-10k", label: "₱5,000 - ₱10,000" },
  { value: "10k-20k", label: "₱10,000 - ₱20,000" },
  { value: "20k-50k", label: "₱20,000 - ₱50,000" },
  { value: "50k+", label: "₱50,000+" },
] as const;
