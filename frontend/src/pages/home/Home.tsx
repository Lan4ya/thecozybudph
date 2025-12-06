import PersistSuspense from "@/components/PersistSuspense";
import Hero from "./components/Hero";
import ProductRecommendations from "./components/Recommendations";
import HomeProductGridSkeleton from "@/lib/ui/skeletons/HomeProductGridSkeleton";
import EventSection from "./components/EventSection";
import { ReviewCarousel } from "./components/ReviewCarousel";
import { useToast } from "@/providers/ToastProvider";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/connect";

const Home = () => {
  const { addToast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // console.log(session);
    };
    getSession();

    const wnu = sessionStorage.getItem("notifySignupSuccess");
    if (wnu) {
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
    <main className="overflow-x-hidden flex-1 flex flex-col gap-20">
      <Hero />

      <EventSection />
      <ReviewCarousel />

      <PersistSuspense fallback={<HomeProductGridSkeleton />}>
        <ProductRecommendations />
      </PersistSuspense>

      <section className="w-full bg-primary/5 rounded-2xl mb-20 py-12 px-6 lg:px-12 ">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl lg:text-4xl font-semibold">
            Unlock Exclusive Vouchers
          </h2>

          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community and get members-only vouchers and special offers
          </p>

          <button
            className="
        mt-6 inline-flex items-center justify-center
        px-6 py-3 rounded-xl font-medium text-white
        bg-primary hover:bg-primary/90 transition
      "
          >
            Sign up now!
          </button>
        </div>
      </section>
    </main>
  );
};

export default Home;
