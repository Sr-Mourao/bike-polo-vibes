import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay bg-background">
      {/* Diagonal accent strips */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary opacity-40 -skew-x-12 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-accent opacity-30 skew-x-6 -translate-x-10" />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ y: 80, opacity: 0, rotate: -3 }}
          animate={{ y: 0, opacity: 1, rotate: -2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-display leading-[0.8] text-primary"
          style={{ textShadow: "6px 6px 0px hsl(20 100% 50%)" }}
        >
          BIKE<br />POLO
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-2xl md:text-4xl font-heading text-primary mt-6 tracking-widest uppercase"
        >
          Bike Polo Brasil.
        </motion.p>

        <motion.a
          href="#o-que-e"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
          className="inline-block mt-10 px-10 py-5 bg-primary text-primary-foreground font-heading text-2xl md:text-3xl uppercase tracking-wider border-4 border-primary hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200 animate-pulse-glow"
        >
          Descubra o Jogo →
        </motion.a>
      </div>

      {/* Decorative scribbles */}
      <svg className="absolute bottom-10 left-10 w-32 h-32 text-primary opacity-20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 5" />
        <line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    </section>
  );
};

export default HeroSection;
