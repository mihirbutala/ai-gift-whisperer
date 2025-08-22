import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
            
            {loading ? (
              <Button variant="outline" size="sm" disabled>
                Loading...
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getUserDisplayName()}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
            
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
            <div className="flex gap-3 pt-4">
              {loading ? (
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  Loading...
                </Button>
              ) : user ? (
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                    <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">{getUserDisplayName()}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="flex-1" onClick={handleSignIn}>
                  Sign In
                </Button>
              )}
              <Button variant="hero" size="sm" className="flex-1">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};