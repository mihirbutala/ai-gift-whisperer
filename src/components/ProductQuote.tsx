import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, DollarSign, TrendingUp, FileText, Sparkles, AlertCircle, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { geminiService } from "@/services/gemini";
import { toast } from "@/components/ui/sonner";
import { useSearchTracking } from "@/hooks/useSearchTracking";
import { AuthModal } from "./AuthModal";

interface ProductQuoteResult {
  productName: string;
  suggestedPrice: string;
  marketComparison: string;
  confidence: number;
  recommendations: string[];
  category: string;
  features: string[];
  competitorPrices: string[];
}

export const ProductQuote = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [productDescription, setProductDescription] = useState("");
  const [quoteResult, setQuoteResult] = useState<ProductQuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canSearch, recordSearch, requiresAuth } = useSearchTracking();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateQuote = async () => {
    if (!uploadedImage && !productDescription.trim()) return;
    
    // Check if user can search
    if (!canSearch) {
      setShowAuthModal(true);
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setQuoteResult(null);
    
    try {
      console.log('Starting product analysis...');
      console.log('Has image:', !!uploadedImage);
      console.log('Has description:', !!productDescription.trim());
      
      // Record the search
      const searchQuery = productDescription.trim() || 'Product image analysis';
      await recordSearch(searchQuery, 'product_quote');
      
      const result = await geminiService.analyzeProductForQuote(
        uploadedImage || undefined,
        productDescription.trim() || undefined
      );
      
      console.log('Received product analysis result:', result);
      setQuoteResult(result);
      toast.success('Product analysis completed with Gemini AI!');
    } catch (error) {
      console.error('Product analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while analyzing the product';
      setError(errorMessage);
      
      if (errorMessage.includes('API key')) {
        toast.error('Gemini API key not configured. Please check your environment variables.');
      } else if (errorMessage.includes('429')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        toast.error('Failed to analyze product with Gemini AI. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After successful auth, user can search again
    if (uploadedImage || productDescription.trim()) {
      handleGenerateQuote();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-background/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {uploadedImage ? (
            <div className="space-y-3">
              <img
                src={uploadedImage}
                alt="Uploaded product"
                className="max-w-full max-h-32 mx-auto rounded-md shadow-soft"
              />
              <p className="text-sm text-muted-foreground">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gradient-accent rounded-full w-fit mx-auto">
                <Upload className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upload Product Image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Product Description (Optional)</label>
          <Textarea
            placeholder="Describe your product in detail to get more accurate INR pricing for Indian market..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="min-h-[80px] bg-background/80 border-border/50 focus:border-primary"
          />
        </div>

        <Button
          onClick={handleGenerateQuote}
          disabled={(!uploadedImage && !productDescription.trim()) || isAnalyzing}
          variant={canSearch ? "accent" : "outline"}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              AI is analyzing...
            </>
          ) : !canSearch ? (
            <>
              <Lock className="h-4 w-4" />
              Sign in to analyze
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              Generate Quote
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
              <p className="text-sm font-medium">Analysis Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quote Results */}
      {quoteResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="h-4 w-4 text-accent" />
            Product Analysis Results
          </div>

          <Card className="overflow-hidden shadow-soft glass-effect">
            <div className="p-6 space-y-6">
              {/* Product Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">
                    {quoteResult.productName}
                  </h3>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {quoteResult.category}
                  </Badge>
                </div>
                
                {/* Confidence Score */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Analysis Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-accent rounded-full transition-all duration-500"
                        style={{ width: `${quoteResult.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-accent">{quoteResult.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    Suggested Price Range
                  </h4>
                  <div className="text-2xl font-bold text-accent">
                    {quoteResult.suggestedPrice}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Market Comparison
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {quoteResult.marketComparison}
                  </p>
                </div>
              </div>

              {/* Features */}
              {quoteResult.features && quoteResult.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quoteResult.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {quoteResult.recommendations && quoteResult.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">AI Recommendations:</h4>
                  <div className="space-y-2">
                    {quoteResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                        <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitor Prices */}
              {quoteResult.competitorPrices && quoteResult.competitorPrices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Market Comparison:</h4>
                  <div className="grid gap-2">
                    {quoteResult.competitorPrices.map((price, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm text-muted-foreground">{price.split(':')[0]}:</span>
                        <span className="text-sm font-medium text-foreground">{price.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Getting Started Help */}
      {!quoteResult && !error && (
        <Card className="p-4 bg-muted/30 border-border/30">
          <div className="text-center space-y-2">
            <ImageIcon className="h-8 w-8 text-accent mx-auto" />
            <h4 className="text-sm font-medium text-foreground">
              {requiresAuth ? "Sign in to continue analyzing" : "Get instant competitive pricing"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {requiresAuth 
                ? "You've used your free analysis. Sign in to get unlimited AI-powered product quotes."
                : "Upload product images or add descriptions to receive Gemini AI-powered Indian market analysis and INR pricing recommendations"
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};