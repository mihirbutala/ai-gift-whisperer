import { useState } from "react";
import { Search, Sparkles, Gift, Star, CheckCircle, Users, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";

interface GiftRecommendation {
  title: string;
  description: string;
  category: string;
  priceRange: string;
  rating: number;
  features: string[];
  suitableFor: string[];
  availability: string;
}

export const AIGiftSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GiftRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const recommendations = await openAIService.generateGiftRecommendations(searchQuery);
      setResults(recommendations);
      toast.success(`Found ${recommendations.length} AI-powered gift recommendations!`);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching');
      toast.error('Failed to generate recommendations. Please try again.');
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
          variant="hero"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              AI is thinking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Gift Ideas
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
            AI-Generated Gift Suggestions
          </div>
          
          <div className="space-y-3">
            {results.map((gift) => (
              <Card key={gift.title} className="p-6 shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 bg-background/60 backdrop-blur-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-sm">{gift.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{gift.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-accent-soft border-accent/20">
                      {gift.category}
                    </Badge>
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
            <h4 className="text-sm font-medium text-foreground">Ready to find the perfect gifts?</h4>
            <p className="text-xs text-muted-foreground">
              Try: "gifts for Indian cardiology conference", "Diwali gifts for hospital staff", or "appreciation gifts for Indian pharmaceutical team"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};