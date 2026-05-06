import { useState } from "react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
// import "swiper/swiper-bundle.css";
import { ProductImage } from "@/components/products/ProductImage";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";

interface CarouselProps {
  urls: string[];
}

const Carousel = ({ urls }: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState<any>(null);
  if (!urls || urls.length === 0) return null;
  const isLgScreen = useIsLgScreenMin();

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === urls.length - 1;

  return (
    <div className="flex flex-col w-full -mt-0.5 lg:mt-0 min-[522px]:pt-10 max-w-[500px] gap-4 lg:pt-0">
      {/* Carousel */}
      <div className=" overflow-hidden relative w-full  bg-background group active:cursor-grabbing">
        {!isLgScreen && (
          <Link
            to="/shop"
            className="z-10 absolute left-3 top-5 rounded-xl bg-black/50  text-white px-3 py-3"
          >
            <ArrowLeft className="size-5" />
          </Link>
        )}

        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          edgeSwipeDetection={true}
          speed={400}
          longSwipes={true}
        >
          {urls.map((u, index) => (
            <SwiperSlide key={index} className="aspect-[3/3.8]">
              <ProductImage
                loading={index === activeIndex ? "eager" : "lazy"}
                src={u}
                alt={`Slide ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nav Buttons */}
        <button
          className={`custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
            isFirstSlide
              ? "cursor-not-allowed border-white/30 bg-white/10 text-white/30"
              : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
          }`}
          disabled={isFirstSlide}
        >
          ‹
        </button>

        <button
          className={`custom-next absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
            isLastSlide
              ? "cursor-not-allowed border-white/30 bg-white/10 text-white/30"
              : "border-white/30 bg-white/20 text-white hover:scale-110 hover:bg-white/30"
          }`}
          disabled={isLastSlide}
        >
          ›
        </button>

        {/* Index Count */}
        <div className="select-none absolute bottom-6 right-6 z-1 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm font-medium">
          {activeIndex + 1} / {urls.length}
        </div>
      </div>

      <ThumbnailStrip
        urls={urls}
        activeIndex={activeIndex}
        onSelect={(index) => mainSwiper?.slideTo(index)}
      />
    </div>
  );
};

const ThumbnailStrip = ({
  urls,
  activeIndex,
  onSelect,
}: {
  urls: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <div className="w-full overflow-x-auto px-6 py-4 rounded-2xl">
      <div className="flex gap-4 min-w-max">
        {urls.map((u, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`size-20 shrink-0 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
              index === activeIndex
                ? "border-accent scale-110 shadow-lg ring-2 ring-accent/50"
                : "border-muted-foreground opacity-60 hover:opacity-100 hover:border-muted-foreground/80"
            } hover:scale-105 transform-gpu`}
          >
            <ProductImage
              src={u}
              alt={`Thumbnail ${index + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
