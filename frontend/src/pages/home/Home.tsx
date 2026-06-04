import PersistSuspense from "@/components/PersistSuspense";
import Hero from "./components/Hero";
import Recommendations from "./components/RecommendationSection";
import HomeProductGridSkeleton from "@/lib/ui/skeletons/HomeProductGridSkeleton";
import EventSection from "./components/EventSection";
import { ReviewCarousel } from "./components/TestimonialSection";
import { ErrorBoundary } from "react-error-boundary";
import { MembersOnlySection } from "./components/MembersOnlySection";

const Home = () => {
  return (
    <main className="overflow-x-hidden flex-1">
      <Hero />
      <EventSection />
      <ReviewCarousel />

      <ErrorBoundary fallback={null}>
        <PersistSuspense fallback={<HomeProductGridSkeleton />}>
          <Recommendations />
        </PersistSuspense>
      </ErrorBoundary>

      <MembersOnlySection />
    </main>
  );
};

export default Home;
