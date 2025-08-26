import { Sparkles, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
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
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" size="sm" onClick={() => setShowAuthModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
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
            <div className="pt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
              <Button 
                variant="hero" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)}
      onSuccess={() => setShowAuthModal(false)}
    />
    </>
  );
};