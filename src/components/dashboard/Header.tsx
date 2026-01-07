import { Terminal, Github, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Terminal className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 animate-pulse-glow">
              <Terminal className="h-8 w-8 text-primary opacity-50 blur-sm" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              <span className="text-primary glow-text-cyan">Voice</span>
              <span className="text-foreground">Test</span>
              <span className="text-secondary glow-text-purple">.ai</span>
            </h1>
            <p className="text-xs text-muted-foreground">Open Source Voice AI Testing</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Zap className="mr-2 h-4 w-4" />
            Quick Test
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Settings className="mr-2 h-4 w-4" />
            Config
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-border hover:border-primary hover:bg-primary/10"
            asChild
          >
            <a 
              href="https://github.com/codeshark2/freevoicetesting" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
