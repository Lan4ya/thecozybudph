import { getAllFileUrlsFromDB } from "@/services/api/storage";
import { useEffect, useState } from "react";

const EventSection = () => {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUrls() {
      try {
        const result = await getAllFileUrlsFromDB("events");
        console.log("Fetched file URLs:", result);
        setUrls(result);
      } catch (err) {
        console.error("Failed to fetch file URLs:", err);
      }
    }

    fetchUrls();
  }, []);

  return (
    <section className="custom-container flex flex-col gap-6">
      {urls.map((url, idx) => (
        <div key={url} className="relative flex">
          <p className="absolute left-0 top-0 max-w-[200px] text-sm md:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
            esse tenetur eius architecto tempore illo, blanditiis, laborum ut
            quidem provident ipsum itaque, vero dolorem! Minus est debitis ullam
            quo sint.
          </p>
          <img
            src={url}
            alt="event image"
            className="object-contain rounded-lg"
          />
        </div>
      ))}
    </section>
  );
};

export default EventSection;
