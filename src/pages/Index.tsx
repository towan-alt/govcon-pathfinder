import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import VideoSection from "@/components/VideoSection";
import ProgramInABox from "@/components/ProgramInABox";
import AboutTowanSection from "@/components/AboutTowanSection";
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
      <VideoSection />
      <ProgramInABox />
      <AboutTowanSection />
      <ClosingSection />
    </main>
  );
};

export default Index;
