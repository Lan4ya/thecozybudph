import { NavLink } from "react-router";
import {
  Flower2,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
} from "lucide-react";

const footerLinks = {
  shop: [
    { label: "Shop", href: "/shop" },
    { label: "Events", href: "/events" },
    { label: "Cart", href: "/cart" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/FAQ" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer Content */}
      <div className="custom-container mx-auto mt-80 px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/90">
                <Flower2 className="size-5 text-primary-foreground" />
              </div>
              <span className="font-back-to-black text-2xl text-primary-foreground">
                The Cozy Bud
              </span>
            </div>
            <p className="text-sm leading-relaxed text-secondary-foreground/80 max-w-xs">
              Handmade florals crafted with love in the Philippines. Bringing
              nature's beauty to your doorstep, one bouquet at a time.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5 pt-1">
              <a
                href="mailto:hello@thecozybud.ph"
                className="flex items-center gap-2.5 text-sm text-secondary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Mail className="size-4 shrink-0" />
                <span>hello@thecozybud.ph</span>
              </a>
              <a
                href="tel:+639123456789"
                className="flex items-center gap-2.5 text-sm text-secondary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Phone className="size-4 shrink-0" />
                <span>+63 912 345 6789</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-secondary-foreground/80">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>Quezon City, Philippines</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-secondary-foreground/10 text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className="text-sm text-secondary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60 mb-4">
              Stay in Bloom
            </h3>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Subscribe for seasonal updates, new arrivals, and exclusive
              offers.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/10 px-3.5 py-2.5 text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="custom-container mx-auto px-4 py-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-secondary-foreground/60 text-center sm:text-left">
            &copy; {new Date().getFullYear()} The Cozy Bud. All rights reserved.
          </p>
          <p className="text-xs text-secondary-foreground/60">
            Handmade with love in the Philippines
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
