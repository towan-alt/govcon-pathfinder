import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import AboutSection from "@/components/AboutSection";
import VideoSection from "@/components/VideoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import OfferVIP from "@/components/OfferVIP";
import OfferVIPDoneForYou from "@/components/OfferVIPDoneForYou";
import OfferMasterclass from "@/components/OfferMasterclass";
import OfferSubstack from "@/components/OfferSubstack";
import ProgramInABox from "@/components/ProgramInABox";
import ClosingSection from "@/components/ClosingSection";
const Index = () => {
  return (
    <main className="min-h-screen scroll-smooth">
      <Navbar />
      <HeroSection />
      <AgencyLogoBar />
      <AboutSection />
      <VideoSection />
      <TestimonialsSection />
      <OfferVIP />
      <OfferVIPDoneForYou />
      <OfferMasterclass />
      <OfferSubstack />
      <ClosingSection />
    </main>
  );
};

export default Index;