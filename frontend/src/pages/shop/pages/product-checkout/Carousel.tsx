import { useState, useCallback, useRef, useEffect } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { ProductImage } from "@/components/products/ProductImage";

interface CarouselProps {
  urls: string[];
}

const SWIPE_THRESHOLD = 100; // px
const SWIPE_VELOCITY = 500; // px/s

const Carousel = ({ urls }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) return null;

  // measure container width so we can compute pixel-based snapping
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // motion value for x offset in px
  const x = useMotionValue(0);

  // bounds for dragConstraints (allow dragging past first/last by a bit because of dragElastic)
  // left = negative max scroll (last slide aligned) e.g. -(n-1) * width
  const maxNegative = -Math.max(0, (urls.length - 1) * containerWidth);
  // right bound is 0 (start)
  const constraints = { left: maxNegative, right: 0 };

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(urls.length - 1, i)),
    [urls.length],
  );

  const snapToIndex = useCallback(
    (index: number) => {
      const target = -index * containerWidth;
      // animate the motion value to the target with a spring for bounce feel
      animate(x, target, {
        type: "spring",
        stiffness: 180,
        damping: 22,
        mass: 0.6,
      });
    },
    [containerWidth, x],
  );

  // whenever currentIndex changes (e.g. via buttons), snap the x
  useEffect(() => {
    if (!containerWidth) return;
    snapToIndex(currentIndex);
  }, [currentIndex, containerWidth, snapToIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((i) => clampIndex(i + 1));
  }, [clampIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((i) => clampIndex(i - 1));
  }, [clampIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(clampIndex(index));
    },
    [clampIndex],
  );

  // drag handler: use offset + velocity to decide
  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      // offset.x is how far the pointer moved during the drag (px)
      // velocity.x is px/s
      const { offset, velocity } = info;
      const swipe = offset.x;
      const v = velocity.x ?? 0;

      // if user dragged left (swipe negative) strongly -> next
      if (swipe < -SWIPE_THRESHOLD || v < -SWIPE_VELOCITY) {
        setCurrentIndex((i) => clampIndex(i + 1));
      }
      // if user dragged right strongly -> prev
      else if (swipe > SWIPE_THRESHOLD || v > SWIPE_VELOCITY) {
        setCurrentIndex((i) => clampIndex(i - 1));
      } else {
        // small drag: snap back to current index
        snapToIndex(currentIndex);
      }
    },
    [clampIndex, currentIndex, snapToIndex],
  );

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === urls.length - 1;

  return (
    <div className="flex flex-col w-full max-w-[500px] gap-4 lg:pt-0">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="min-[504px]:rounded-xl relative aspect-[3/3.8] w-full overflow-hidden  bg-background group content-visibility-auto "
      >
        {/* Slides Container: make THIS draggable and controlled by motion-value x */}
        <motion.div
          className="flex h-full active:cursor-grabbing"
          style={{ x }} // bind motion value so drag moves it and we can animate it programmatically
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.6} // gives the rubber-y feel when dragging past bounds
          onDragEnd={handleDragEnd}
          // touch-action none is helpful for a better touch experience
          // (you can add inline style or tailwind plugin)
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

        {/* Navigation Buttons (unchanged) */}
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

      {/* Thumbnail Strip (unchanged) */}
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
