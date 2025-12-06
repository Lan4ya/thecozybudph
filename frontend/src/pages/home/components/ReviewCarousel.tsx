import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { Star } from "lucide-react";
import no_pic from "@/assets/thecozybud/no_pic.png";
import { useAnimationFrame } from "framer-motion";
import { useRef } from "react";

const SPEED = 0.45;

export interface Review {
  name: string;
  review: string;
  rating: number; // 1-5
  avatar?: string;
}

const dummyReviews: Review[] = [
  {
    name: "Ava M.",
    review:
      "Grabe, ang ganda ng mga bulaklak! Tumagal pa siya ng higit sa isang linggo.",
    rating: 5,
    avatar: no_pic,
  },
  {
    name: "Liam R.",
    review:
      "Super bilis ng delivery at ang ganda ng pagkakaayos ng bouquet. Highly recommended!",
    rating: 4,
    avatar: no_pic,
  },
  {
    name: "Sofia G.",
    review: "Mas maganda pa talaga ang bouquet in person kesa sa mga pictures!",
    rating: 5,
    avatar: no_pic,
  },
  {
    name: "Noah P.",
    review:
      "Ayos ang service at maganda ang packaging, talagang nakaka-impress.",
    rating: 4,
    avatar: no_pic,
  },
];

export const ReviewCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!containerRef.current) return;

    const width = containerRef.current.scrollWidth / 2;

    xRef.current -= SPEED * (delta / 16.67); // normalize for 60fps

    if (Math.abs(xRef.current) >= width) {
      xRef.current = 0; // reset seamlessly
    }

    containerRef.current.style.transform = `translateX(${xRef.current}px)`;
  });

  return (
    <section className="custom-container flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl lg:text-3xl">Customer Reviews</h2>
        <p>Real stories from customers who’ve shared their CozyBud moments.</p>
      </div>

      <div ref={containerRef} className="flex gap-6 will-change-transform">
        {[...dummyReviews, ...dummyReviews].map((review, i) => (
          <ReviewCard key={i} {...review} />
        ))}
      </div>
    </section>
  );
};

// Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem corrupti ducimus molestias, accusantium unde doloremque deleniti aspernatur similique cum voluptatum ad explicabo aliquam sapiente temporibus! Tempore maxime omnis deserunt dolores?

export const ReviewCard = ({ name, review, rating, avatar }: Review) => {
  return (
    <Card className="rounded-3xl shadow-md bg-white/60 backdrop-blur p-6 w-[280px] shrink-0">
      <CardContent className="flex flex-col gap-4 p-0 h-full">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          )}
          <span className="font-semibold text-gray-900">{name}</span>
        </div>

        {/* Review Text */}
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 flex-1">
          “{review}”
        </p>

        {/* Stars */}
        <div className="flex gap-1 mt-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={20}
              className={
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
