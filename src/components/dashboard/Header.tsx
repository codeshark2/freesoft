import { Link } from 'react-router-dom';
import { Settings, Github, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVendorConfig } from '@/hooks/useVendorConfig';

const Header = () => {
  const { configuredCount, totalCount, hasMinimumConfig } = useVendorConfig();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 animate-ping opacity-30">
              <Radio className="h-6 w-6 text-primary" />
            </div>
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Free<span className="text-primary">Voice</span> Testing
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <div className="relative">
                <Settings className="h-4 w-4" />
                {!hasMinimumConfig && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="hidden sm:inline">Config</span>
              <span className="text-xs text-muted-foreground">
                {configuredCount}/{totalCount}
              </span>
            </Button>
          </Link>
          <a href="https://github.com/codeshark2/freevoicetesting" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </Button>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
