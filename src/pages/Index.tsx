import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import OfferVIP from "@/components/OfferVIP";
import OfferMasterclass from "@/components/OfferMasterclass";
import OfferSubstack from "@/components/OfferSubstack";
import ClosingSection from "@/components/ClosingSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <OfferVIP />
      <OfferMasterclass />
      <OfferSubstack />
      <ClosingSection />
    </main>
  );
};

export default Index;
