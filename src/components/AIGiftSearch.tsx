import { useState } from "react";
import { Search, Sparkles, Gift, Star, CheckCircle, Users, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { geminiService } from "@/services/gemini";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSearchTracking } from "@/hooks/useSearchTracking";
import { AuthModal } from "@/components/AuthModal";

interface GiftRecommendation {
  title: string;
  description: string;
  category: string;
  priceRange: string;
  rating: number;
  features: string[];
  suitableFor: string[];
  availability: string;
  imageUrl?: string;
}

export const AIGiftSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GiftRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { canSearch, recordSearch, requiresAuth } = useSearchTracking();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Check if authentication is required
    if (requiresAuth) {
      setShowAuthModal(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      console.log('Starting search with query:', searchQuery);
      
      // Add the specified prompt prefix to the user's query
      const modifiedQuery = `Suggest me unique gift related to (${searchQuery}) give me 4 products with proper product images and description and approx rates`;
      console.log('Modified query sent to Gemini:', modifiedQuery);
      
      const recommendations = await geminiService.generateGiftRecommendations(modifiedQuery);
      console.log('Received recommendations:', recommendations);
      
      // Record the search
      await recordSearch(searchQuery, 'ai_search');
      
      setResults(recommendations);
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
            placeholder="Describe your specific gifting needs (e.g., 'premium gifts for Indian cardiologists at medical conference', 'wellness products for hospital staff during monsoon season')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 py-3 text-sm bg-background/80 border-border/50 focus:border-primary"
          />
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={!searchQuery.trim() || isLoading || (!canSearch && !isAuthenticated)}
          variant="hero"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Gemini AI is analyzing your request...
            </>
          ) : requiresAuth ? (
            <>
              <Sparkles className="h-4 w-4" />
              Sign In to Continue Searching
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get AI-Powered Gift Recommendations
            </>
          )}
        </Button>
      </div>

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
            AI-Powered Gift Recommendations
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((gift, index) => (
              <Card key={index} className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02] glass-effect">
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={gift.imageUrl}
                    alt={gift.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {gift.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{gift.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                      {gift.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {gift.description}
                    </p>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      {gift.priceRange}
                    </Badge>
                  </div>

                  {/* Features */}
                  {gift.features && gift.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {gift.features.slice(0, 3).map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suitable For */}
                  {gift.suitableFor && gift.suitableFor.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Suitable For:</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{gift.suitableFor.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {gift.availability && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{gift.availability}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button variant="outline" className="w-full mt-4">
                    <CheckCircle className="h-4 w-4" />
                    Select This Gift
                  </Button>
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
              Ready to find the perfect gifts?
            </h4>
            <p className="text-xs text-muted-foreground">
              Try specific queries like: "premium stethoscopes for Indian cardiologists", "Ayurvedic wellness gifts for hospital staff during Diwali", or "digital health monitoring devices for rural healthcare workers"
            </p>
          </div>
        </Card>
      )}
    </div>
    
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)}
      onSuccess={() => setShowAuthModal(false)}
    />
    </>
  );
};