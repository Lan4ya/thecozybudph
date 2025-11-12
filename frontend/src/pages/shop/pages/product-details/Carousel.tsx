import { useState, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ProductImage } from "@/components/products/ProductImage";

interface CarouselProps {
  urls: string[];
}

const Carousel = ({ urls }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (currentIndex < urls.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  }, [currentIndex, urls.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      if (
        (offset.x < -50 || velocity.x < -500) &&
        currentIndex < urls.length - 1
      ) {
        nextSlide();
      } else if ((offset.x > 50 || velocity.x > 500) && currentIndex > 0) {
        prevSlide();
      }
    },
    [currentIndex, nextSlide, prevSlide, urls.length],
  );

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === urls.length - 1;

  return (
    <div className="flex flex-col w-full max-w-[500px] gap-4 lg:pt-0">
      {/* Carousel Container */}
      <div className="relative aspect-[3/3.8] w-full overflow-hidden shadow-2xl bg-black group  content-visibility-auto">
        {/* Slides Container */}
        <motion.div
          className="flex h-full"
          animate={{ x: -currentIndex * 100 + "%" }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
        >
          {urls.map((u, index) => (
            <div key={index} className="shrink-0 w-full h-full">
              <ProductImage
                loading={index === currentIndex ? "eager" : "lazy"}
                src={u}
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </motion.div>

        {/* Drag Overlay for Swipe Gestures */}
        <motion.div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
        />

        {/* Navigation Buttons */}
        {urls.length > 1 && (
          <>
            <button
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                isFirstSlide
                  ? "bg-white/10 border-accent/10 text-accent/30 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-accent"
              }`}
              onClick={prevSlide}
              disabled={isFirstSlide}
            >
              ‹
            </button>

            <button
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                isLastSlide
                  ? "bg-white/10 border-accent/10 text-accent/30 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-accent"
              }`}
              onClick={nextSlide}
              disabled={isLastSlide}
            >
              ›
            </button>
          </>
        )}

        {/* Slide Indicator */}
        <div className="absolute bottom-6 right-6 z-30 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm font-medium">
          {currentIndex + 1} / {urls.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="w-full overflow-x-auto px-6 py-4 rounded-2xl">
        <div className="flex gap-4 min-w-max">
          {urls.map((u, index) => (
            <button
              key={index}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                index === currentIndex
                  ? "border-accent scale-110 shadow-lg ring-2 ring-accent/50"
                  : "border-muted-foreground opacity-60 hover:opacity-100 hover:border-muted-foreground/80"
              } hover:scale-105 transform-gpu`}
              onClick={() => goToSlide(index)}
            >
              <ProductImage src={u} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
