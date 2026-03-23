import isDev from "@/lib/utils/isDev";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

// Toggle TQDV with alt + q
export function TanstackQueryDevtoolsToggle() {
  if (!isDev) return null; // ofc dev only

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "q") {
        console.log("hit");
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {open && (
        <ReactQueryDevtools initialIsOpen={true} buttonPosition="bottom-left" />
      )}
    </>
  );
}
