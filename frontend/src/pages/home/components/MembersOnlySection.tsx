import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

export const MembersOnlySection = () => {
  const session = useAuthStore((s) => s.session);

  if (session) return null;

  return (
    <section className="">
      <div className="custom-container relative max-w-[1420px] mx-auto overflow-hidden rounded-3xl mb-32 border border-accent/10 bg-gradient-to-br from-accent/5 via-background to-primary/5 px-6 py-12 md:px-10 lg:px-14 lg:py-14">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-5xl items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 text-center lg:text-left"
          >
            {/* Eyebrow */}
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70">
              Members
            </p>

            {/* Heading */}
            <h2 className="font-ivy-ora-display text-4xl leading-tight text-accent lg:text-5xl">
              Exclusive perks for thoughtful gifters
            </h2>

            {/* Description */}
            <p className="max-w-[52ch] text-lg text-muted-foreground">
              Join CozyBud to access limited drops, seasonal bundles, and
              curated rewards designed for those who value meaningful gifting.
            </p>

            {/* Inline benefit */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
              <span>✨</span> Welcome vouchers for new members
            </div>
          </motion.div>

          {/* Right CTA */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex flex-col gap-4 px-8 backdrop-blur-sm"
          >
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Create an account
            </Link>

            <p className="text-center text-xs text-muted-foreground lg:text-left">
              Already a member?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Log in
              </Link>{" "}
              to view your rewards.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MembersOnlySection;
