import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import TrainingBanner from "@/components/TrainingBanner";
import StatsSection from "@/components/StatsSection";
import WhyTowanSection from "@/components/WhyTowanSection";
import CaseStudySection from "@/components/CaseStudySection";
import ServiceComparison from "@/components/ServiceComparison";
import OfferVIPDoneForYou from "@/components/OfferVIPDoneForYou";
import TestimonialsSection from "@/components/TestimonialsSection";
import VideoSection from "@/components/VideoSection";
import FaqSection from "@/components/FaqSection";
import ClosingSection from "@/components/ClosingSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <Navbar />
      <main>
        <HeroSection />
        <AgencyLogoBar />
        <TrainingBanner />
        <StatsSection />
        <WhyTowanSection />
        <CaseStudySection />
        <ServiceComparison />
        <OfferVIPDoneForYou />
        <VideoSection />
        <TestimonialsSection />
        <FaqSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
