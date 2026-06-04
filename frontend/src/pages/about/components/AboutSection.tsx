import { cn } from "@/lib/utils/cn";

interface AboutSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  index: number;
}

const AboutSection = ({
  registerSentinel,
  visibleMap,
  index,
}: AboutSectionProps) => {
  return (
    <section className="custom-container py-16 lg:py-24">
      <div
        ref={registerSentinel}
        className={cn(
          "max-w-4xl mx-auto text-center transition-all duration-900 ease-out",
          visibleMap[index]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-6">
          About The Cozy Bud
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Cozy Bud provides fresh, elegant flower arrangements for every
          occasion. From birthdays to weddings, we carefully design each bouquet
          to bring happiness and beauty to your special moments. Our passion for
          floristry shines through in every arrangement we create.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
