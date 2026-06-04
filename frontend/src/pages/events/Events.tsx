import { useState } from "react";
import { motion } from "framer-motion";
import { EventInquiryForm } from "./components";
import type { CreateEventInquiryInput } from "@cozybud/schemas";
import { useToast } from "@/providers/ToastProvider";
import { useEventInquiryMutations } from "@/hooks/useEventInquiries";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Heart,
  Sparkles,
  Calendar,
  Palette,
  Phone,
  CheckCircle,
} from "lucide-react";
import { ASSETS } from "@/lib/constants/assets";

const eventCategories = [
  {
    title: "Weddings",
    description: "Elegant floral arrangements for your special day",
    icon: Heart,
  },
  {
    title: "Corporate Events",
    description: "Professional designs that impress clients and colleagues",
    icon: Sparkles,
  },
  {
    title: "Birthdays",
    description: "Celebratory blooms for milestone moments",
    icon: Calendar,
  },
  {
    title: "Custom Styling",
    description: "Bespoke floral art tailored to your vision",
    icon: Palette,
  },
];

const galleryImages = [
  { src: ASSETS.EVENT_1, alt: "Wedding floral arrangement" },
  { src: ASSETS.EVENT_2, alt: "Event centerpiece design" },
  { src: ASSETS.EVENT_3, alt: "Elegant bouquet display" },
  { src: ASSETS.EVENT_4, alt: "Floral decoration setup" },
];

const Events = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();
  const { createInquiry } = useEventInquiryMutations();

  const handleInquirySubmit = async (data: CreateEventInquiryInput) => {
    try {
      await createInquiry.mutateAsync(data);

      setIsSubmitted(true);
      addToast(
        "Thank you for your inquiry! We'll be in touch soon.",
        "success",
      );
    } catch (error) {
      addToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/40 to-transparent z-10" />
        <img
          src={ASSETS.EVENT_1}
          alt="CozyBud Events"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 custom-container h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="font-ivy-ora-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
              Events with
              <br />
              <span className="text-primary">CozyBud</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Transform your special occasions with our bespoke floral designs.
              From intimate gatherings to grand celebrations, we bring your
              vision to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-16 lg:py-24 bg-primary/5">
        <div className="custom-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-4">
              What We Offer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive floral services for every type of celebration
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <category.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 lg:py-24">
        <div className="custom-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-4">
              Our Work
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A glimpse into the celebrations we&apos;ve had the honor of
              embellishing
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-7/6 overflow-hidden rounded-xl group"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section
        id="inquiry-form"
        className="py-16 lg:py-24 bg-linear-to-b from-primary/5 to-background"
      >
        <div className="custom-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-ivy-ora-display text-3xl lg:text-4xl font-semibold mb-4">
                  Let&apos;s Plan Your
                  <br />
                  <span className="text-primary">Perfect Event</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us about your vision and we&apos;ll create a customized
                  floral proposal just for you. Whether it&apos;s an intimate
                  gathering or a grand celebration, we&apos;re here to make it
                  unforgettable.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Personalized Consultation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We work closely with you to understand your vision and
                      preferences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Custom Design Proposal
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Receive a detailed proposal with mood boards, flower
                      selections, and pricing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Full Service Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      From delivery to installation, we handle every detail on
                      your special day.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Prefer to call us?
                </p>
                <a
                  href="tel:+639123456789"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                >
                  <Phone className="w-4 h-4" />
                  +63 912 345 6789
                </a>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg border border-border/50"
            >
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Inquiry Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We&apos;ll review your request
                    and get back to you within 24-48 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-1">
                      Event Inquiry
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form below and we&apos;ll get back to you
                      shortly.
                    </p>
                  </div>
                  <EventInquiryForm
                    onSubmit={handleInquirySubmit}
                    isSubmitting={createInquiry.isPending}
                  />
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
