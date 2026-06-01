import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Clock,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Label } from "@/lib/ui/__shadcn__/label";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useToast } from "@/providers/ToastProvider";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  subject: z.string().trim().min(1, "Subject is required"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});

type ContactFormInput = z.infer<typeof contactFormSchema>;

const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Support" },
  { value: "custom", label: "Custom Arrangement" },
  { value: "corporate", label: "Corporate Gifting" },
  { value: "feedback", label: "Feedback" },
];

const ContactInfoItem = ({
  icon: Icon,
  title,
  content,
  href,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  href?: string;
}) => {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-accent mb-1">{title}</h4>
        {href ? (
          <a
            href={href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {content}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{content}</p>
        )}
      </div>
    </div>
  );
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { registerSentinel, visibleMap } = useAnimateOnView(0.1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "general",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Contact form submitted:", data);
      addToast(
        "Message sent successfully! We'll get back to you soon.",
        "success",
      );
      reset();
    } catch (error) {
      addToast("Failed to send message. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-linear-to-b from-primary/5 to-background">
      {/* Header Section */}
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20">
        <div className="custom-container text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70 mb-4">
              Get in touch
            </p>
            <h1 className="font-ivy-ora-display text-4xl lg:text-6xl text-accent leading-tight">
              We&apos;d love to hear from you
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Whether you have a question about our blooms, need help with an
              order, or want to discuss a custom arrangement, our team is here
              for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 lg:pb-32">
        <div className="custom-container">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-24 max-w-[1200px] mx-auto items-start">
            {/* Contact Info Card */}
            <div
              ref={registerSentinel}
              className={cn(
                "space-y-10 transition-all duration-1000 ease-out",
                visibleMap[0]
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <div className="space-y-8">
                <ContactInfoItem
                  icon={Mail}
                  title="Email Us"
                  content="hello@cozybud.ph"
                  href="mailto:hello@cozybud.ph"
                />
                <ContactInfoItem
                  icon={Phone}
                  title="Call or Text"
                  content="+63 912 345 6789"
                  href="tel:+639123456789"
                />
                <ContactInfoItem
                  icon={MapPin}
                  title="Our Location"
                  content="Metro Manila, Philippines"
                />
                <ContactInfoItem
                  icon={Clock}
                  title="Business Hours"
                  content="Mon - Sun: 9:00 AM - 8:00 PM"
                />
              </div>

              <div className="pt-10 border-t border-border/50">
                <h4 className="font-semibold text-accent mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-white border border-border/50 rounded-xl text-accent hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-white border border-border/50 rounded-xl text-accent hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div
              ref={registerSentinel}
              className={cn(
                "relative transition-all duration-1000 delay-100 ease-out",
                visibleMap[1]
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-linear-to-br from-primary/10 via-accent/5 to-transparent blur-2xl opacity-50" />
              <div className="bg-card rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-accent/5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        {...register("name")}
                        className={cn(errors.name && "border-red-500")}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        {...register("email")}
                        className={cn(errors.email && "border-red-500")}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      {...register("subject")}
                      className="flex h-10 w-full rounded-md border border-input bg-popover px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={6}
                      {...register("message")}
                      className={cn(
                        "resize-none",
                        errors.message && "border-red-500",
                      )}
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 rounded-2xl group relative overflow-hidden"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner className="mr-2" />
                    ) : (
                      <Send className="mr-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
