import PersistSuspense from "@/components/PersistSuspense";
import Hero from "./components/Hero";
import Recommendations from "./components/RecommendationSection";
import HomeProductGridSkeleton from "@/lib/ui/skeletons/HomeProductGridSkeleton";
import EventSection from "./components/EventSection";
import { ReviewCarousel } from "./components/TestimonialSection";
import { ErrorBoundary } from "react-error-boundary";
import { MembersOnlySection } from "./components/MembersOnlySection";
import {
  getAllRegions,
  getAllProvinces,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from "@aivangogh/ph-address";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    const regions = getAllRegions();
    const searchTerm = "NATIONAL CAPITAL REGION";
    const ncr = regions.find((r) => new RegExp(searchTerm, "i").test(r.name));

    if (!ncr) {
      throw new Error("NCR region not found");
    }
    const ncrCities = getMunicipalitiesByProvince(ncr?.psgcCode);
    console.log(ncrCities); // Output: '1300000000'
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
