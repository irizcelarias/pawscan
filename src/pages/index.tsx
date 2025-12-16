import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FunFactsSection from "@/components/FunFactsSection";
import ChatBot from "@/components/ChatBot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FunFactsSection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
