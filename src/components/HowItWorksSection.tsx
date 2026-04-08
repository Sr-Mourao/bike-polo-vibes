import { motion } from "framer-motion";

const keywords = [
  { word: "3x3", bg: "bg-secondary", text: "text-secondary-foreground", rotate: "-rotate-2" },
  { word: "HARDCOURT", bg: "bg-primary", text: "text-primary-foreground", rotate: "rotate-1" },
  { word: "MALLET", bg: "bg-accent", text: "text-accent-foreground", rotate: "-rotate-3" },
  { word: "VELOCIDADE", bg: "bg-secondary", text: "text-secondary-foreground", rotate: "rotate-2" },
  { word: "ESTRATÉGIA", bg: "bg-primary", text: "text-primary-foreground", rotate: "-rotate-1" },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-20 md:py-32 grain-overlay bg-background overflow-hidden">
      {/* Diagonal top border */}
      <div className="absolute top-0 left-0 w-full h-3 bg-primary" />

      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-display text-primary text-center mb-16"
        >
          Como funciona?
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
          {keywords.map((item, i) => (
            <motion.div
              key={item.word}
              initial={{ y: 60, opacity: 0, rotate: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`${item.bg} ${item.text} ${item.rotate} px-8 py-6 md:px-12 md:py-10 border-4 border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))]`}
            >
              <span className="font-display text-4xl md:text-6xl lg:text-7xl whitespace-nowrap">
                {item.word}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comic explosion shapes */}
      <svg className="absolute top-20 left-5 w-24 h-24 text-accent opacity-40" viewBox="0 0 100 100">
        <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-10 right-10 w-32 h-32 text-secondary opacity-30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="8 6" />
      </svg>
    </section>
  );
};

export default HowItWorksSection;
