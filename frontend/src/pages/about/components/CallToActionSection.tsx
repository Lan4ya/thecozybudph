import { NavLink } from "react-router";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";

interface CallToActionSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  index: number;
}

const CallToActionSection = ({
  registerSentinel,
  visibleMap,
  index,
}: CallToActionSectionProps) => {
  return (
    <section className="custom-container py-16 lg:py-24">
      <div
        ref={registerSentinel}
        className={cn(
          "max-w-4xl mx-auto text-center space-y-6 transition-all duration-900 ease-out",
          visibleMap[index]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold">
          Ready to Brighten Someone's Day?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our collection or contact us to order your perfect bouquet
          today. We're here to help you celebrate life's special moments.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <NavLink to="/shop">
            <Button size="lg" className="px-8">
              Shop Now
            </Button>
          </NavLink>
          <NavLink to="/contact">
            <Button variant="outline" size="lg" className="px-8">
              Contact Us
            </Button>
          </NavLink>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
