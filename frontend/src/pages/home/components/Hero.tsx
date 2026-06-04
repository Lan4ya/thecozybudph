import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ASSETS } from "@/lib/constants/assets";
import { cn } from "@/lib/utils/cn";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { motion } from "framer-motion";

const imgSrcs = [
  ASSETS.TCB_1,
  ASSETS.TCB_6,
  ASSETS.TCB_7,
  ASSETS.TCB_5,
  ASSETS.TCB_3,
];
const TRANSITION_MS = 1000;

const Hero = () => {
  const isLgScreenMin = useIsLgScreenMin();

  return (
    <section aria-label="Hero" className="custom-container w-full">
      {isLgScreenMin ? <DesktopHeroInner /> : <MobileHeroInner />}
    </section>
  );
};

const MobileHeroInner = () => {
  const slides = [imgSrcs[imgSrcs.length - 1], ...imgSrcs, imgSrcs[0]];
  const [index, setIndex] = useState(1);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => i + 1);
    }, 15000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (index === slides.length - 1) {
      setTimeout(() => {
        setTransition(false);
        setIndex(1);
      }, TRANSITION_MS);
    }
  }, [index, slides.length]);

  useEffect(() => {
    if (!transition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransition(true);
        });
      });
    }
  }, [transition]);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-8 pt-8 pb-18">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-accent/10 bg-accent/5 px-5 py-6 text-center"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent/70">
          The Cozy Bud
        </p>
        <h1 className="font-ivy-ora-display text-3xl font-semibold text-accent">
          Floral stories, styled for every moment
        </h1>
        <p className="mx-auto mt-3 max-w-[38ch] text-sm text-muted-foreground">
          Fresh handcrafted arrangements with modern elegance, thoughtful
          detail, and same-day convenience.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            to="/shop"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Shop now
          </Link>
          <Link
            to="/about"
            className="rounded-xl border border-accent/20 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/5"
          >
            Our story
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="overflow-hidden rounded-3xl border border-accent/10 shadow-xl bg-card"
      >
        <div
          className="flex h-full transition-transform"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transitionDuration: transition ? `${TRANSITION_MS}ms` : "0ms",
          }}
        >
          {slides.map((src, i) => (
            <div key={i} className="relative h-full w-full shrink-0 aspect-4/5">
              <ProgressiveImage
                key={i}
                src={src}
                decoding="sync"
                alt={`Product image ${i + 1}`}
                isEager={i === index}
                className={cn(src === imgSrcs[0] && "object-fit ")}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const DesktopHeroInner = () => {
  return (
    <div className="mx-auto grid w-full max-w-[1420px] items-center gap-10 py-30 pb-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-14">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70">
          The Cozy Bud
        </p>

        <h1 className="font-ivy-ora-display text-5xl leading-tight text-accent xl:text-6xl">
          Modern floral design for meaningful days
        </h1>

        <p className="max-w-[52ch] text-lg text-muted-foreground">
          Elevated arrangements crafted with intention. From everyday gifting to
          milestone celebrations, each bouquet is curated to feel timeless and
          personal.
        </p>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Explore collection
          </Link>
          <Link
            to="/about"
            className="rounded-xl border border-accent/20 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent/5"
          >
            Meet CozyBud
          </Link>
        </div>

        <div className="grid max-w-[540px] grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl border border-accent/10 bg-accent/5 px-4 py-3">
            <p className="text-sm font-semibold text-accent">
              Everlasting form
            </p>
            <p className="text-xs text-muted-foreground">
              Naturally preserved blooms
            </p>
          </div>

          <div className="rounded-2xl border border-accent/10 bg-accent/5 px-4 py-3">
            <p className="text-sm font-semibold text-accent">
              Softly aged palette
            </p>
            <p className="text-xs text-muted-foreground">
              Muted tones that evolve gracefully
            </p>
          </div>

          <div className="rounded-2xl border border-accent/10 bg-accent/5 px-4 py-3">
            <p className="text-sm font-semibold text-accent">
              Designed to linger
            </p>
            <p className="text-xs text-muted-foreground">
              Pieces meant for long-term display
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative"
      >
        <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-accent/10 to-transparent blur-2xl" />
        <div className="overflow-hidden rounded-[2.5rem] border border-accent/10 bg-card shadow-2xl">
          <ProgressiveImage
            src={ASSETS.TCB_1}
            alt="CozyBud floral arrangement"
            isEager={true}
            decoding="sync"
            className="pointer-events-none h-[620px] select-none"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
