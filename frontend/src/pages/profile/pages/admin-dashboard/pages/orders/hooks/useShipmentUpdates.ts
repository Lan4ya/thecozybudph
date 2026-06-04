import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

function useShipmentUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("shipment-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Listen for updates
          schema: "public",
          table: "shipments", // The table you want to listen to
        },
        (payload) => {
          const updatedShipment = payload.new; // The new shipment data

          // Invalidate queries that depend on shipments
          queryClient.invalidateQueries({
            queryKey: ["shipment", updatedShipment.orderId],
          });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
