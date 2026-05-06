import PersistSuspense from "@/components/PersistSuspense";
import Hero from "./components/Hero";
import Recommendations from "./components/RecommendationSection";
import HomeProductGridSkeleton from "@/lib/ui/skeletons/HomeProductGridSkeleton";
import EventSection from "./components/EventSection";
import { ReviewCarousel } from "./components/TestimonialSection";
import { useToast } from "@/providers/ToastProvider";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MembersOnlySection } from "./components/MembersOnlySection";

const Home = () => {
  const { addToast } = useToast();

  useEffect(() => {
    const nss = sessionStorage.getItem("notifySignupSuccess");
    if (nss) {
      sessionStorage.removeItem("notifySignupSuccess");
      addToast("Account created successfully...");
    }

    const nls = sessionStorage.getItem("notifyLogInSuccess");
    if (nls) {
      sessionStorage.removeItem("notifyLogInSuccess");
      addToast("Log in success...");
    }
  }, []);

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
