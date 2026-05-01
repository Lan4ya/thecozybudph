import e1 from "@/assets/thecozybud/event_pic_1.jpg";
import e2 from "@/assets/thecozybud/event_pic_2.jpg";
import e3 from "@/assets/thecozybud/event_pic_3.jpg";
import e4 from "@/assets/thecozybud/event_pic_4.jpg";

const imgSrcs = [e1, e2, e3, e4];

import { useState } from "react";
import { Navigation, A11y, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
import { ProductImage } from "@/components/products/ProductImage";
import { cn } from "@/lib/utils/cn";

const EventSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === imgSrcs.length - 1;

  return (
    <section className="custom-container w-full">
      <div className="mx-auto grid w-full max-w-[1200px] gap-5 md:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="space-y-2 lg:space-y-3">
          <h2 id="events-heading" className="text-2xl lg:text-3xl">
          Events with CozyBud
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            A curated look at the intimate gatherings and grand celebrations
            we’ve elevated with timeless, handcrafted floral art.
          </p>
        </div>

        {/* Main Carousel */}
        <div className="w-full">
          <div className="group relative w-full overflow-hidden bg-background active:cursor-grabbing">
            <Swiper
              modules={[Thumbs, Navigation, A11y]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: ".custom-prev",
                nextEl: ".custom-next",
              }}
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.activeIndex);
              }}
              edgeSwipeDetection={true}
              speed={400}
              longSwipes={true}
            >
              {imgSrcs.map((u, index) => (
                <SwiperSlide key={index} className="aspect-[4/3] sm:aspect-7/6">
                  <ProductImage
                    loading={index === activeIndex ? "eager" : "lazy"}
                    src={u}
                    alt={`Slide ${index + 1}`}
                    roundedSize="xl"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav Buttons */}
            <button
              className={`custom-prev absolute left-2 top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-lg backdrop-blur-sm transition-all duration-200 sm:size-12 sm:text-2xl ${
                isFirstSlide
                  ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                  : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
              }`}
              disabled={isFirstSlide}
            >
              ‹
            </button>

            <button
              className={`custom-next absolute right-2 top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-lg backdrop-blur-sm transition-all duration-200 sm:size-12 sm:text-2xl ${
                isLastSlide
                  ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                  : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
              }`}
              disabled={isLastSlide}
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="mt-3 flex w-full justify-center gap-2">
            {imgSrcs.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full bg-gray-500 sm:h-2.5 sm:w-2.5",
                  i === activeIndex && "bg-accent",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSection;
