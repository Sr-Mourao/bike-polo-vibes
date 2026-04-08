import { motion } from "framer-motion";

const WhatIsSection = () => {
  return (
    <section
      id="o-que-e"
      className="relative py-24 md:py-32 grain-overlay bg-primary overflow-hidden"
    >
      {/* Diagonal accent */}
      <div className="absolute top-0 left-0 w-full h-4 bg-secondary" />
      <div className="absolute -top-8 right-0 w-1/2 h-24 bg-accent skew-y-3 opacity-70" />

      <div className="container max-w-4xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-display text-primary-foreground mb-8"
          style={{ transform: "rotate(-1deg)" }}
        >
          O que é Bike Polo?
        </motion.h2>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl text-primary-foreground/90 font-body leading-relaxed max-w-2xl"
        >
          Dois times. Três jogadores. Uma quadra de concreto. Bicicletas, mallets e uma bola.
          O <strong className="text-yellow-bright">hardcourt bike polo</strong> é um esporte urbano
          intenso, rápido e cheio de estratégia — nascido nas ruas e movido por uma comunidade underground global.
        </motion.p>
      </div>

      {/* Decorative explosion */}
      <svg className="absolute bottom-0 right-0 w-48 h-48 text-secondary opacity-30" viewBox="0 0 200 200">
        <polygon points="100,10 130,80 200,80 145,125 165,200 100,155 35,200 55,125 0,80 70,80" fill="currentColor" />
      </svg>
    </section>
  );
};

export default WhatIsSection;
