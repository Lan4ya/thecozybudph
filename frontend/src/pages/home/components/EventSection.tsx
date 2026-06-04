import { ASSETS } from "@/lib/constants/assets";
import { useState } from "react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
import { ProductImage } from "@/components/products/ProductImage";
import { cn } from "@/lib/utils/cn";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

const imgSrcs = [
  ASSETS.EVENT_1,
  ASSETS.EVENT_2,
  ASSETS.EVENT_3,
  ASSETS.EVENT_4,
];

const EventSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === imgSrcs.length - 1;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/events");
  };

  return (
    <section className="bg-primary/5">
      <div className="space-y-12 w-full py-18 lg:py-24 custom-container justify-between gap-5 md:gap-10 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:[grid-template-areas:'carousel_text'] max-w-[1420px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 lg:text-right"
        >
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
        </motion.div>

        {/* Main Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="lg:[grid-area:carousel] group relative w-full overflow-hidden active:cursor-grabbing"
        >
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
                <div
                  onClick={handleImageClick}
                  className="size-full cursor-pointer"
                >
                  <ProductImage
                    loading={index === activeIndex ? "eager" : "lazy"}
                    src={u}
                    alt={`Slide ${index + 1}`}
                    roundedSize="xl"
                  />
                </div>
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
        </motion.div>
      </div>
    </section>
  );
};

export default EventSection;
