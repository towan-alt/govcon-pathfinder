import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import VideoSection from "@/components/VideoSection";
import ClosingSection from "@/components/ClosingSection";
import NaicsFinderSection from "@/components/NaicsFinderSection";

const Index = () => {
  return (
    <main className="min-h-screen scroll-smooth">
      <Navbar />
      <HeroSection />
      <AgencyLogoBar />
      <AboutSection />
      <NaicsFinderSection />
      <TestimonialsSection />
      <ServicesSection />
      <VideoSection />
      <ClosingSection />
    </main>
  );
};

export default Index;
