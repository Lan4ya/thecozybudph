import { cn } from "@/lib/utils/cn";
import aboutUsPic from "@/assets/thecozybud/about_us_pic.jpg";

interface StorySectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  index: number;
}

const StorySection = ({ registerSentinel, visibleMap, index }: StorySectionProps) => {
  return (
    <section className="bg-secondary/10 py-16 lg:py-24">
      <div className="custom-container">
        <div
          ref={registerSentinel}
          className={cn(
            "grid lg:grid-cols-2 gap-12 items-center transition-all duration-900 ease-out",
            visibleMap[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="order-2 lg:order-1">
            <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded with a deep love for floral design, The Cozy Bud started as a
                small passion project and has blossomed into a beloved local flower shop.
              </p>
              <p>
                Our journey began with a simple belief: flowers have the power to convey
                emotions, celebrate moments, and bring joy to everyday life. Every stem
                we select, every arrangement we craft, carries this philosophy.
              </p>
              <p>
                Today, we continue to serve our community with the same dedication and
                artistry that inspired us from the beginning. Each bouquet tells a story,
                and we're honored to be part of yours.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="aspect-4/3 rounded-2xl overflow-hidden">
              <img
                src={aboutUsPic}
                alt="Our story"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;