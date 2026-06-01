import { supabase } from "@/lib/supabase/client";

const getAssetUrl = (name: string) => {
  const { data } = supabase.storage.from("assets").getPublicUrl(`${name}.webp`);
  return data.publicUrl;
};

/**
 * Manifest registry for site assets hosted on Supabase Storage.
 * These were migrated from local src/assets to optimize build and performance.
 */
export const ASSETS = {
  ABOUT_US: getAssetUrl("about_us_pic"),
  EVENT_1: getAssetUrl("event_pic_1"),
  EVENT_2: getAssetUrl("event_pic_2"),
  EVENT_3: getAssetUrl("event_pic_3"),
  EVENT_4: getAssetUrl("event_pic_4"),
  LOGO_MINI: getAssetUrl("logo_mini_transparent"),
  LOGO_ONELINE: getAssetUrl("logo_transparent_oneline"),
  LOGO_ONELINE_ALT: getAssetUrl("logo_transparent_oneline1"),
  LOGO_PADDING: getAssetUrl("logo_transparent_with_padding"),
  LOGO_FULL: getAssetUrl("logo_transparent"),
  NO_PIC: getAssetUrl("no_pic"),
  TCB_1: getAssetUrl("TCB_1"),
  TCB_2: getAssetUrl("TCB_2"),
  TCB_3: getAssetUrl("TCB_3"),
  TCB_4: getAssetUrl("TCB_4"),
  TCB_5: getAssetUrl("TCB_5"),
  TCB_6: getAssetUrl("TCB_6"),
  TCB_7: getAssetUrl("TCB_7"),
} as const;
