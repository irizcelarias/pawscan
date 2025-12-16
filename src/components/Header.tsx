import { PawPrint } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">PetScan AI</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
