import HeroSection from "@/components/HeroSection";
import WhatIsSection from "@/components/WhatIsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FinalSection from "@/components/FinalSection";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <WhatIsSection />
      <HowItWorksSection />
      <section className="py-16 grain-overlay bg-primary text-primary-foreground text-center space-y-6">
        <Link
          to="/double_elimination"
          className="inline-block px-10 py-5 bg-secondary text-secondary-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-secondary-foreground/20 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Criar Double Elimination 🏆
        </Link>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/login" className="px-8 py-4 bg-card text-card-foreground font-heading text-xl uppercase tracking-wider border-4 border-border hover:border-secondary transition-colors">
            🔐 Área Administrativa
          </Link>
          <Link to="/public" className="px-8 py-4 bg-card text-card-foreground font-heading text-xl uppercase tracking-wider border-4 border-border hover:border-secondary transition-colors">
            📊 Resultados Públicos
          </Link>
        </div>
      </section>
      <FinalSection />
    </main>
  );
};

export default Index;
