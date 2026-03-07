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
    <section className="custom-container flex flex-col gap-6 w-full max-w-[500px]">
      <div>
        <h2 id="recommendations-heading" className="text-2xl lg:text-3xl">
          Events with CozyBud
        </h2>
        <p>
          A curated look at the intimate gatherings and grand celebrations we’ve
          elevated with timeless, handcrafted floral art.
        </p>
      </div>

      {/* Main Carousel */}
      <div className="overflow-hidden relative w-full  bg-background group active:cursor-grabbing">
        <Swiper
          modules={[Thumbs, Navigation, A11y]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          // thumbs={{ swiper: thumbsSwiper }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          edgeSwipeDetection={true}
          speed={400}
          longSwipes={true}
        >
          {imgSrcs.map((u, index) => (
            <SwiperSlide key={index} className="aspect-7/6 rounded-xl">
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
          className={`custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
            isFirstSlide
              ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
              : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
          }`}
          disabled={isFirstSlide}
        >
          ‹
        </button>

        <button
          className={`custom-next absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
            isLastSlide
              ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
              : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
          }`}
          disabled={isLastSlide}
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="-mt-2 flex gap-2 justify-center w-full">
        {imgSrcs.map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full bg-gray-500",
              i === activeIndex && "bg-accent",
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default EventSection;
