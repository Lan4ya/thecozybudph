import { cn } from "@/lib/utils/cn";
import { Flower, Sparkles, Truck, Heart } from "lucide-react";

const whyChooseUs = [
  { text: "Fresh flowers sourced daily", icon: Flower },
  { text: "Creative and unique arrangements", icon: Sparkles },
  { text: "Fast and reliable delivery", icon: Truck },
  { text: "Customer satisfaction guaranteed", icon: Heart },
];

interface WhyChooseUsSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  titleIndex: number;
  startIndex: number;
}

const WhyChooseUsSection = ({
  registerSentinel,
  visibleMap,
  titleIndex,
  startIndex,
}: WhyChooseUsSectionProps) => {
  return (
    <section className="custom-container py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div
          ref={registerSentinel}
          className={cn(
            "text-center mb-12 transition-all duration-900 ease-out",
            visibleMap[titleIndex]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-4">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground">
            Here's what makes The Cozy Bud special
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {whyChooseUs.map((item, index) => (
            <div
              key={item.text}
              ref={registerSentinel}
              className={cn(
                "flex items-center gap-4 p-6 bg-secondary/10 rounded-xl transition-all duration-900 ease-out",
                visibleMap[startIndex + index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <item.icon size={32} className="text-primary flex-shrink-0" />
              <p className="text-lg font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;