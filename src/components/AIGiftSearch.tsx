import { useState } from "react";
import { Search, Sparkles, Gift, Star, CheckCircle, Users, MapPin, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { geminiService } from "@/services/gemini";
import { toast } from "@/components/ui/sonner";
import { useSearchTracking } from "@/hooks/useSearchTracking";
import { AuthModal } from "./AuthModal";

interface GiftRecommendation {
  title: string;
  description: string;
  category: string;
  priceRange: string;
  rating: number;
  features: string[];
  suitableFor: string[];
  availability: string;
  image?: string;
}

export const AIGiftSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GiftRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { canSearch, recordSearch, requiresAuth } = useSearchTracking();

  // Function to get appropriate image based on gift category/title
  const getGiftImage = (title: string, category: string): string => {
    const lowerTitle = title.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    if (lowerTitle.includes('medical') || lowerTitle.includes('stethoscope') || lowerCategory.includes('medical')) {
      return 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerTitle.includes('wellness') || lowerTitle.includes('ayurvedic') || lowerCategory.includes('wellness')) {
      return 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerTitle.includes('conference') || lowerTitle.includes('kit') || lowerCategory.includes('conference')) {
      return 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerTitle.includes('digital') || lowerTitle.includes('technology') || lowerCategory.includes('technology')) {
      return 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerTitle.includes('book') || lowerTitle.includes('education') || lowerCategory.includes('education')) {
      return 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    if (lowerTitle.includes('premium') || lowerTitle.includes('luxury') || lowerCategory.includes('premium')) {
      return 'https://images.pexels.com/photos/1666065/pexels-photo-1666065.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
    }
    // Default pharmaceutical/medical gift image
    return 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
  };
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Check if user can search
    if (!canSearch) {
      setShowAuthModal(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      console.log('Starting search with query:', searchQuery);
      
      // Record the search
      await recordSearch(searchQuery, 'ai_search');
      
      const recommendations = await geminiService.generateGiftRecommendations(searchQuery);
      console.log('Received recommendations:', recommendations);
      
      // Add images to recommendations
      const recommendationsWithImages = recommendations.map(rec => ({
        ...rec,
        image: getGiftImage(rec.title, rec.category)
      }));
      
      setResults(recommendationsWithImages);
      toast.success(`Found ${recommendations.length} Gemini AI-powered gift recommendations!`);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while searching';
      setError(errorMessage);
      
      if (errorMessage.includes('API key')) {
        toast.error('Gemini API key not configured. Please check your environment variables.');
      } else if (errorMessage.includes('429')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error('Failed to generate recommendations with Gemini AI. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After successful auth, user can search again
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Describe your gifting needs (e.g., 'gifts for Indian cardiology conference attendees')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 py-3 text-sm bg-background/80 border-border/50 focus:border-primary"
          />
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={!searchQuery.trim() || isLoading}
          variant={canSearch ? "hero" : "outline"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              AI is thinking...
            </>
          ) : !canSearch ? (
            <>
              <Lock className="h-4 w-4" />
              Sign in to search
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Gift Ideas
            </>
          )}
        </Button>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Search Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Gift className="h-4 w-4 text-accent" />
            AI-Generated Gift Suggestions
          </div>
          
          <div className="space-y-3">
            {results.map((gift) => (
              <Card key={gift.title} className="overflow-hidden shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 bg-background/60 backdrop-blur-sm">
                {/* Large Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="text-xs bg-background/90 border-accent/20 backdrop-blur-sm">
                      {gift.category}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-sm">{gift.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{gift.description}</p>
                    </div>
                  </div>
                  
                  {/* Features */}
                  {gift.features.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Key Features
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {gift.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-success/10 border-success/20 text-success">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suitable For */}
                  {gift.suitableFor.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Suitable for: {gift.suitableFor.join(", ")}</span>
                    </div>
                  )}

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(gift.rating) 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{gift.rating}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-accent">{gift.priceRange}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {gift.availability}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Help - Only show when no results and no error */}
      {results.length === 0 && !error && (
        <Card className="p-4 bg-muted/30 border-border/30">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 text-accent mx-auto" />
            <h4 className="text-sm font-medium text-foreground">
              {requiresAuth ? "Sign in to continue searching" : "Ready to find the perfect gifts?"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {requiresAuth 
                ? "You've used your free search. Sign in to get unlimited AI-powered gift recommendations."
                : 'Try: "gifts for Indian cardiology conference", "Diwali gifts for hospital staff", or "appreciation gifts for Indian pharmaceutical team"'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};