import { motion } from "framer-motion";
import { ASSETS } from "@/lib/constants/assets";

export const HeroSection = () => {
  return (
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

          <p className="text-lg md:text-xl max-w-xl">
            Transform your special occasions with our bespoke floral designs.
            From intimate gatherings to grand celebrations, we bring your vision
            to life.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
