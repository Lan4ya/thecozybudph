import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Truck,
  CreditCard,
  RotateCcw,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  icon: React.ReactNode;
  title: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    icon: <Package className="size-5" />,
    title: "Products & Availability",
    items: [
      {
        question: "What types of flowers and arrangements do you offer?",
        answer:
          "We offer a wide variety of fresh-cut flowers, potted plants, dried florals, and custom arrangements. Our specialties include romantic rose bouquets, sunflower mixes, tulip assortments, and seasonal wildflower bundles. We also create custom arrangements for weddings, birthdays, anniversaries, and corporate events.",
      },
      {
        question: "Can I request a custom arrangement?",
        answer:
          "Absolutely! We love creating bespoke floral designs. You can contact us through our website or visit our shop to discuss your vision. Please provide at least 3-5 days' notice for custom orders to ensure we can source the freshest blooms.",
      },
      {
        question: "Are your flowers sourced locally?",
        answer:
          "We prioritize locally sourced flowers from trusted farms in Benguet, Tagaytay, and Davao. During peak seasons or for exotic varieties, we also import from select international suppliers to ensure the highest quality and freshness.",
      },
    ],
  },
  {
    icon: <Truck className="size-5" />,
    title: "Delivery & Shipping",
    items: [
      {
        question: "What areas do you deliver to?",
        answer:
          "We currently deliver within Metro Manila, including Quezon City, Makati, Mandaluyong, Pasig, Taguig, Pasay, and Manila. We also serve select areas in Cavite, Laguna, and Rizal. Enter your address at checkout to confirm delivery availability.",
      },
      {
        question: "How much is the delivery fee?",
        answer:
          "Delivery fees start at ₱150 for Metro Manila addresses. Rates vary based on distance and order size. Orders above ₱3,000 qualify for free standard delivery within Metro Manila. Same-day and express delivery options are available at an additional cost.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery takes 1-2 business days. Same-day delivery is available for orders placed before 12:00 PM, subject to availability. During peak seasons (Valentine's Day, Mother's Day, Christmas), we recommend ordering at least 3 days in advance.",
      },
      {
        question: "Can I schedule a specific delivery time?",
        answer:
          "Yes! You can select a preferred delivery date and time slot during checkout. We offer morning (9AM-12PM), afternoon (1PM-5PM), and evening (5PM-8PM) slots. For specific time requests, please contact our customer service team.",
      },
    ],
  },
  {
    icon: <CreditCard className="size-5" />,
    title: "Orders & Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept GCash, Maya, bank transfers (BPI, BDO, Metrobank), credit/debit cards via Stripe, and cash on delivery (COD) for select areas. All online payments are processed securely through our trusted payment partners.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "Orders can be modified or cancelled within 2 hours of placement, provided they haven't entered the preparation stage. For same-day orders, changes must be made within 30 minutes. Contact us immediately at support@cozybud.ph or through our live chat.",
      },
      {
        question: "Will I receive an order confirmation?",
        answer:
          "Yes, you'll receive an order confirmation email immediately after checkout. We'll also send you updates via email and SMS when your order is being prepared, out for delivery, and delivered.",
      },
    ],
  },
  {
    icon: <RotateCcw className="size-5" />,
    title: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Due to the perishable nature of flowers, we accept returns only for damaged or incorrect items reported within 24 hours of delivery. Please include clear photos of the issue when contacting us. Refunds are processed within 5-7 business days.",
      },
      {
        question: "What if my flowers arrive damaged?",
        answer:
          "We take great care in packaging, but if your flowers arrive damaged, please contact us within 24 hours with photos. We'll arrange a replacement delivery or issue a full refund based on your preference and availability.",
      },
    ],
  },
  {
    icon: <MessageCircle className="size-5" />,
    title: "Account & Support",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "You can create an account by clicking 'Sign Up' on our website. You'll need a valid email address and phone number. Having an account allows you to track orders, save addresses, earn loyalty points, and receive exclusive offers.",
      },
      {
        question: "How can I contact customer support?",
        answer:
          "You can reach us via email at support@cozybud.ph, through our website's live chat (available 9AM-6PM daily), or by phone at +63 912 345 6789. We typically respond to emails within 24 hours.",
      },
      {
        question: "Do you offer corporate or bulk orders?",
        answer:
          "Yes! We offer special pricing and packages for corporate clients, events, and bulk orders. Contact our corporate team at corporate@cozybud.ph for a personalized quote and dedicated account management.",
      },
    ],
  },
];

const AccordionItem = ({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between py-4 px-1 text-left transition-colors hover:text-primary",
          isOpen && "text-primary",
        )}
      >
        <span className="font-medium text-sm md:text-base pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 px-1 text-sm text-muted-foreground leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="flex-1">
      {/* Hero Header */}
      <section className="bg-card/40">
        <div className="custom-container mx-auto py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <HelpCircle className="size-6" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Find answers to common questions about our products, delivery,
            payments, and more. Can't find what you're looking for? Reach out to
            our support team.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="custom-container mx-auto py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {faqCategories.map((category) => (
            <div
              key={category.title}
              className="bg-card rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b bg-card flex items-center gap-3">
                <span className="text-primary">{category.icon}</span>
                <h2 className="font-semibold text-foreground">
                  {category.title}
                </h2>
              </div>
              <div className="px-5">
                {category.items.map((item, idx) => {
                  const key = `${category.title}-${idx}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-10 text-center">
          <div className="bg-card rounded-xl border border-primary/10 p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground">
              Still have questions?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our friendly support team is here to help. Reach out and we'll get
              back to you within 24 hours.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="size-4" />
                Contact Us
              </a>
              <a
                href="mailto:support@cozybud.ph"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                support@cozybud.ph
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
