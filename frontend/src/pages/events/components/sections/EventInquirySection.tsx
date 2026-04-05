import { useState } from "react";
import { motion } from "framer-motion";
import { EventInquiryForm } from "@/pages/events/components";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Phone, CheckCircle } from "lucide-react";
import type { EventInquiryInput } from "@TheCozyBud/types";

interface EventInquirySectionProps {
  onSubmit: (data: EventInquiryInput) => Promise<void>;
  isSubmitting: boolean;
}

const ServiceFeature = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
      <CheckCircle className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ContactInfo = () => (
  <div className="pt-6 border-t">
    <p className="text-sm text-muted-foreground mb-2">Prefer to call us?</p>
    <a
      href="tel:+639123456789"
      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
    >
      <Phone className="w-4 h-4" />
      +63 912 345 6789
    </a>
  </div>
);

const InquirySuccessState = ({
  onReset,
}: {
  onReset: () => void;
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-2xl font-semibold mb-2">Inquiry Sent!</h3>
    <p className="text-muted-foreground mb-6">
      Thank you for reaching out. We&apos;ll review your request and get back to
      you within 24-48 hours.
    </p>
    <Button variant="outline" onClick={onReset} className="w-full">
      Send Another Inquiry
    </Button>
  </div>
);

const InquiryFormHeader = () => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-1">Event Inquiry</h3>
    <p className="text-sm text-muted-foreground">
      Fill out the form below and we&apos;ll get back to you shortly.
    </p>
  </div>
);

export const EventInquirySection = ({
  onSubmit,
  isSubmitting,
}: EventInquirySectionProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: EventInquiryInput) => {
    await onSubmit(data);
    setIsSubmitted(true);
  };

  return (
    <section className="py-16 lg:py-24 bg-linear-to-b from-primary/5 to-background">
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
              <ServiceFeature
                title="Personalized Consultation"
                description="We work closely with you to understand your vision and preferences."
              />
              <ServiceFeature
                title="Custom Design Proposal"
                description="Receive a detailed proposal with mood boards, flower selections, and pricing."
              />
              <ServiceFeature
                title="Full Service Setup"
                description="From delivery to installation, we handle every detail on your special day."
              />
            </div>

            <ContactInfo />
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
              <InquirySuccessState onReset={() => setIsSubmitted(false)} />
            ) : (
              <>
                <InquiryFormHeader />
                <EventInquiryForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
