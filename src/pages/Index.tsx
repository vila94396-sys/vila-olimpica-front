import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Leadership from "@/components/Leadership";
import Properties from "@/components/Properties";
import Entrepreneurs from "@/components/Entrepreneurs";
import News from "@/components/News";

import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <News />
      <Leadership />
      <Properties />
      <Entrepreneurs />
      
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
