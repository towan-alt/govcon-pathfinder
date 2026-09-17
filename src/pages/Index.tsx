import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import FitQuizSection from "@/components/FitQuizSection";
import OfferVIPDoneForYou from "@/components/OfferVIPDoneForYou";
import OfferMasterclass from "@/components/OfferMasterclass";
import VideoSection from "@/components/VideoSection";
import ClosingSection from "@/components/ClosingSection";

const Index = () => {
  return (
    <main className="min-h-screen scroll-smooth">
      <Navbar />
      <HeroSection />
      <AgencyLogoBar />
      <AboutSection />
      <TestimonialsSection />
      <ServicesSection />
      <FitQuizSection />
      <OfferVIPDoneForYou />
      <OfferMasterclass />
      <VideoSection />
      <ClosingSection />
    </main>
  );
};

export default Index;
