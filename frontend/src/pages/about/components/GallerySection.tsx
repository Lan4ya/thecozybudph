import { useState } from "react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";

import { cn } from "@/lib/utils/cn";
import { ProductImage } from "@/components/products/ProductImage";
import { ASSETS } from "@/lib/constants/assets";

const galleryImages = [
  ASSETS.TCB_5,
  ASSETS.TCB_6,
  ASSETS.TCB_7,
  ASSETS.TCB_3,
  ASSETS.EVENT_1,
  ASSETS.EVENT_2,
  ASSETS.EVENT_3,
  ASSETS.EVENT_4,
];

interface GallerySectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  titleIndex: number;
  carouselIndex: number;
}

const GallerySection = ({
  registerSentinel,
  visibleMap,
  titleIndex,
  carouselIndex,
}: GallerySectionProps) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const isGalleryFirst = activeGalleryIndex === 0;
  const isGalleryLast = activeGalleryIndex === galleryImages.length - 1;

  return (
    <section className="bg-secondary/10 py-16 lg:py-24">
      <div className="custom-container">
        <div
          ref={registerSentinel}
          className={cn(
            "text-center mb-12 transition-all duration-900 ease-out",
            visibleMap[titleIndex]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-4">
            Our Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a look at some of our beautiful arrangements and past events
          </p>
        </div>

        <div
          ref={registerSentinel}
          className={cn(
            "max-w-2xl mx-auto transition-all duration-900 ease-out",
            visibleMap[carouselIndex]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8",
          )}
        >
          {/* Gallery Carousel */}
          <div className="overflow-hidden relative w-full bg-background rounded-xl group active:cursor-grabbing">
            <Swiper
              modules={[Navigation, A11y]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: ".gallery-prev",
                nextEl: ".gallery-next",
              }}
              onSlideChange={(swiper) => {
                setActiveGalleryIndex(swiper.activeIndex);
              }}
              edgeSwipeDetection={true}
              speed={400}
              longSwipes={true}
            >
              {galleryImages.map((src, index) => (
                <SwiperSlide key={index} className="aspect-4/3">
                  <ProductImage
                    loading={index === activeGalleryIndex ? "eager" : "lazy"}
                    src={src}
                    alt={`Gallery ${index + 1}`}
                    roundedSize="xl"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav Buttons */}
            <button
              className={`gallery-prev absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                isGalleryFirst
                  ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
              }`}
              disabled={isGalleryFirst}
            >
              ‹
            </button>

            <button
              className={`gallery-next absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                isGalleryLast
                  ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
              }`}
              disabled={isGalleryLast}
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="mt-4 flex gap-2 justify-center w-full">
            {galleryImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full bg-gray-400 transition-colors",
                  i === activeGalleryIndex && "bg-accent",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;

