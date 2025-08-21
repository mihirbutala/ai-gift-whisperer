import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="relative z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-futuristic rounded-lg animate-pulse-glow">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-futuristic bg-clip-text text-transparent">GiftAI Pro</span>
              <span className="text-xl font-bold bg-gradient-futuristic bg-clip-text text-transparent">supergifter.ai</span>
              <span className="text-xs bg-gradient-accent bg-clip-text text-transparent font-medium">India</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/ai-search" 
              className={`transition-colors ${isActive('/ai-search') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              AI Search
            </Link>
            <Link 
              to="/product-quote" 
              className={`transition-colors ${isActive('/product-quote') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Product Quote
            </Link>
            <Link 
              to="/features" 
              className={`transition-colors ${isActive('/features') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`transition-colors ${isActive('/pricing') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors ${isActive('/about') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              About
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-4">
            <Link 
              to="/ai-search" 
              className={`block transition-colors ${isActive('/ai-search') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              AI Search
            </Link>
            <Link 
              to="/product-quote" 
              className={`block transition-colors ${isActive('/product-quote') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Product Quote
            </Link>
            <Link 
              to="/features" 
              className={`block transition-colors ${isActive('/features') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`block transition-colors ${isActive('/pricing') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`block transition-colors ${isActive('/about') ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="sm" className="flex-1">
                Sign In
              </Button>
              <Button variant="hero" size="sm" className="flex-1">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};