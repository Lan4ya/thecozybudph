import { cn } from "@/lib/utils/cn";

interface MissionSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  index: number;
}

const MissionSection = ({
  registerSentinel,
  visibleMap,
  index,
}: MissionSectionProps) => {
  return (
    <section className="custom-container py-16 lg:py-24">
      <div
        ref={registerSentinel}
        className={cn(
          "max-w-3xl mx-auto text-center transition-all duration-900 ease-out",
          visibleMap[index]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-6">
          Our Mission
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Our mission is to deliver fresh, high-quality flowers and create
          beautiful arrangements that make every occasion memorable. We believe
          in sustainable sourcing, supporting local growers, and crafting
          designs that capture the essence of nature's beauty.
        </p>
      </div>
    </section>
  );
};

export default MissionSection;
