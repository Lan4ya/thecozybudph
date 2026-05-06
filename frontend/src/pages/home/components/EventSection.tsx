import e1 from "@/assets/thecozybud/event_pic_1.jpg";
import e2 from "@/assets/thecozybud/event_pic_2.jpg";
import e3 from "@/assets/thecozybud/event_pic_3.jpg";
import e4 from "@/assets/thecozybud/event_pic_4.jpg";
import { useState } from "react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
import { ProductImage } from "@/components/products/ProductImage";
import { cn } from "@/lib/utils/cn";

const imgSrcs = [e1, e2, e3, e4];

const EventSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === imgSrcs.length - 1;

  return (
    <section className="bg-primary/5">
      <div className="space-y-12 w-full py-24 custom-container justify-between  gap-5 md:gap-10 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:[grid-template-areas:'carousel_text'] max-w-[1420px] mx-auto ">
        <div className="space-y-6 lg:text-right">
          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70">
            Events with cozybud
          </p>

          {/* Heading */}
          <h2 className="font-ivy-ora-display text-4xl leading-tight text-accent lg:text-5xl">
            Floral design for life’s most memorable gatherings
          </h2>

          {/* Description */}
          <p className="lg:ml-auto max-w-[52ch] text-lg text-muted-foreground">
            From intimate celebrations to large-scale occasions, each
            arrangement is composed with intention—designed to elevate the
            atmosphere and leave a lasting impression.
          </p>
        </div>

        {/* Main Carousel */}
        <div className="lg:[grid-area:carousel] group relative w-full overflow-hidden active:cursor-grabbing">
          <Swiper
            modules={[Navigation, A11y]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              prevEl: ".event-section-prev",
              nextEl: ".event-section-next",
            }}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex);
            }}
            edgeSwipeDetection={true}
            speed={400}
            longSwipes={true}
          >
            {imgSrcs.map((u, index) => (
              <SwiperSlide key={index} className="aspect-4/3 sm:aspect-7/6">
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
            type="button"
            className={`event-section-prev absolute left-2 top-1/2 z-30 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-lg backdrop-blur-sm transition-all duration-200 sm:size-12 sm:text-2xl lg:flex ${
              isFirstSlide
                ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
            }`}
            disabled={isFirstSlide}
          >
            ‹
          </button>

          <button
            type="button"
            className={`event-section-next absolute right-2 top-1/2 z-30 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-lg backdrop-blur-sm transition-all duration-200 sm:size-12 sm:text-2xl lg:flex ${
              isLastSlide
                ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
            }`}
            disabled={isLastSlide}
          >
            ›
          </button>

          {/* Dots */}
          <div className="mt-4 flex gap-2 justify-center w-full">
            {imgSrcs.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full bg-gray-400 transition-colors",
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
