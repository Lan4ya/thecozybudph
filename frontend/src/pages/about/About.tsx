import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import StorySection from "./components/StorySection";
import MissionSection from "./components/MissionSection";
import ServicesSection from "./components/ServicesSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import GallerySection from "./components/GallerySection";
import CallToActionSection from "./components/CallToActionSection";

const About = () => {
  const { registerSentinel, visibleMap } = useAnimateOnView();

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section - uses visibleMap[0] and [1] */}
      <HeroSection registerSentinel={registerSentinel} visibleMap={visibleMap} />

      {/* About the Shop Section */}
      <AboutSection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        index={2}
      />

      {/* Our Story Section */}
      <StorySection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        index={3}
      />

      {/* Our Mission Section */}
      <MissionSection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        index={4}
      />

      {/* Our Services Section - titleIndex: 5, startIndex: 6-11 (6 items) */}
      <ServicesSection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        titleIndex={5}
        startIndex={6}
      />

      {/* Why Choose Us Section - titleIndex: 12, startIndex: 13-16 (4 items) */}
      <WhyChooseUsSection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        titleIndex={12}
        startIndex={13}
      />

      {/* Gallery Section - titleIndex: 17, carouselIndex: 18 */}
      <GallerySection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        titleIndex={17}
        carouselIndex={18}
      />

      {/* Call to Action Section */}
      <CallToActionSection
        registerSentinel={registerSentinel}
        visibleMap={visibleMap}
        index={19}
      />
    </main>
  );
};

export default About;