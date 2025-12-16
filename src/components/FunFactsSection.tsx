import { Dog, Cat, Heart, Sparkles, Brain, Zap, PawPrint, Star } from "lucide-react";

const funFacts = [
  {
    icon: Dog,
    title: "Dogs Dream Too!",
    fact: "Dogs experience REM sleep just like humans and likely dream about their daily activities like playing fetch or chasing squirrels.",
    category: "dog",
  },
  {
    icon: Cat,
    title: "Cats Sleep 70% of Their Lives",
    fact: "The average cat spends about 13-16 hours sleeping each day, which adds up to roughly 70% of their entire lives.",
    category: "cat",
  },
  {
    icon: Heart,
    title: "A Dog's Nose is Unique",
    fact: "Just like human fingerprints, every dog's nose print is unique and can be used to identify them.",
    category: "dog",
  },
  {
    icon: Brain,
    title: "Cats Have 230 Bones",
    fact: "Cats have 230 bones in their body, while humans only have 206. This extra flexibility helps them squeeze into tight spaces.",
    category: "cat",
  },
  {
    icon: Zap,
    title: "Dogs Understand 250 Words",
    fact: "The average dog can understand about 250 words and gestures, similar to a 2-year-old child's vocabulary.",
    category: "dog",
  },
  {
    icon: Star,
    title: "Cats Can Rotate Their Ears 180°",
    fact: "Cats have 32 muscles in each ear, allowing them to rotate their ears 180 degrees to pinpoint sounds.",
    category: "cat",
  },
];

const FunFactsSection = () => {
  return (
    <section id="features" className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-peach px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Fun Facts</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Amazing Pet Facts
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover fascinating facts about your furry companions that will make you love them even more!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funFacts.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                item.category === "dog" ? "bg-peach" : "bg-secondary"
              }`}>
                <item.icon className={`w-6 h-6 ${
                  item.category === "dog" ? "text-primary" : "text-accent"
                }`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <PawPrint className={`w-4 h-4 ${
                  item.category === "dog" ? "text-primary" : "text-accent"
                }`} />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.fact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FunFactsSection;
