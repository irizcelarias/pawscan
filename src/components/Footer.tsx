import { PawPrint, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-warm flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">PetScan AI</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for pet lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
