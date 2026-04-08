import { motion } from "framer-motion";

const FinalSection = () => {
  return (
    <section className="relative py-24 md:py-36 grain-overlay bg-accent overflow-hidden">
      {/* Diagonal strips */}
      <div className="absolute top-0 left-0 w-full h-4 bg-primary" />
      <div className="absolute -top-6 left-0 w-2/3 h-16 bg-secondary skew-y-2 opacity-60" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.blockquote
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl lg:text-8xl font-display text-accent-foreground leading-tight max-w-5xl mx-auto"
          style={{ transform: "rotate(-1deg)" }}
        >
          "Não é só um jogo.<br />
          É cultura urbana<br />
          sobre rodas."
        </motion.blockquote>

        <motion.a
          href="#"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-block mt-12 px-10 py-5 bg-primary text-primary-foreground font-heading text-2xl md:text-3xl uppercase tracking-wider border-4 border-accent-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
        >
          Conheça mais sobre nós
        </motion.a>
      </div>

      {/* Decorative */}
      <svg className="absolute bottom-5 left-5 w-20 h-20 text-accent-foreground opacity-20" viewBox="0 0 100 100">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="3" />
      </svg>
    </section>
  );
};

export default FinalSection;
