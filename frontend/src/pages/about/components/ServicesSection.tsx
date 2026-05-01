import { cn } from "@/lib/utils/cn";
import {



  
  Flower,
  Leaf,
  Heart,
  Truck,
  Sparkles,
  Gift,
} from "lucide-react";

const services = [
  {
    title: "Flower Bouquets",
    description: "Handcrafted arrangements for any occasion",
    icon: Flower,
  },
  {
    title: "Event Decorations",
    description: "Stunning floral designs for your special events",
    icon: Leaf,
  },
  {
    title: "Wedding Arrangements",
    description: "Make your big day unforgettable with our blooms",
    icon: Heart,
  },
  {
    title: "Same-Day Delivery",
    description: "Fresh flowers delivered right to your door",
    icon: Truck,
  },
  {
    title: "Custom Designs",
    description: "Personalized arrangements tailored to your vision",
    icon: Sparkles,
  },
  {
    title: "Gift Wrapping",
    description: "Beautiful packaging for your floral gifts",
    icon: Gift,
  },
];

interface ServicesSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
  titleIndex: number;
  startIndex: number;
}

const ServicesSection = ({
  registerSentinel,
  visibleMap,
  titleIndex,
  startIndex,
}: ServicesSectionProps) => {
  return (
    <section className="bg-primary/5 py-16 lg:py-24">
      <div className="custom-container">
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
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer a wide range of floral services to meet all your needs
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              ref={registerSentinel}
              className={cn(
                "bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300",
                visibleMap[startIndex + index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-4">
                <service.icon size={40} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;