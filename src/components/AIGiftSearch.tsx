import { useState } from "react";
import { Search, Sparkles, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GiftIdea {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  rating: number;
}

export const AIGiftSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GiftIdea[]>([]);

  const mockResults: GiftIdea[] = [
    {
      id: 1,
      title: "Premium Medical Conference Package",
      description: "Complete package including branded notebooks, high-quality pens, and educational materials perfect for pharmaceutical conferences.",
      category: "Conference Gifts",
      price: "$45-65",
      rating: 4.8
    },
    {
      id: 2,
      title: "Wellness & Health Gift Set",
      description: "Curated collection of wellness products including stress-relief items, healthy snacks, and branded water bottles.",
      category: "Wellness",
      price: "$35-50",
      rating: 4.6
    },
    {
      id: 3,
      title: "Educational Medical Literature",
      description: "Latest pharmaceutical research books and journals tailored to specific medical specialties and interests.",
      category: "Educational",
      price: "$25-40",
      rating: 4.9
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 1500);
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
            placeholder="Describe your gifting needs (e.g., 'gifts for cardiology conference attendees')"
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

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Gift className="h-4 w-4 text-accent" />
            AI-Generated Gift Suggestions
          </div>
          
          <div className="space-y-3">
            {results.map((gift) => (
              <Card key={gift.id} className="p-4 shadow-soft border-border/50 hover:shadow-medium transition-all duration-300 bg-background/60 backdrop-blur-sm">
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
                    <div className="text-sm font-semibold text-accent">{gift.price}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Help */}
      {results.length === 0 && (
        <Card className="p-4 bg-muted/30 border-border/30">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 text-accent mx-auto" />
            <h4 className="text-sm font-medium text-foreground">Ready to find the perfect gifts?</h4>
            <p className="text-xs text-muted-foreground">
              Try searches like "gifts for medical conference" or "appreciation gifts for hospital staff"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};