import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, DollarSign, TrendingUp, FileText, Sparkles, AlertCircle, Lock } from "lucide-react";
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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
            AI Pricing Analysis
          </div>

          <div className="p-4 bg-background border border-border rounded-lg font-mono text-sm">
            <div className="space-y-3">
              <div>
                <strong>Product Name:</strong> {quoteResult.productName}
              </div>
              <div>
                <strong>Category:</strong> {quoteResult.category}
              </div>
              <div>
                <strong>Suggested Price:</strong> {quoteResult.suggestedPrice}
              </div>
              <div>
                <strong>Market Comparison:</strong> {quoteResult.marketComparison}
              </div>
              <div>
                <strong>Confidence:</strong> {quoteResult.confidence}%
              </div>
              
              {quoteResult.features.length > 0 && (
                <div>
                  <strong>Key Features:</strong>
                  <div className="ml-4 mt-1">
                    {quoteResult.features.map((feature, index) => (
                      <div key={index}>• {feature}</div>
                    ))}
                  </div>
                </div>
              )}

              {quoteResult.competitorPrices.length > 0 && (
                <div>
                  <strong>Market Comparison:</strong>
                  <div className="ml-4 mt-1">
                    {quoteResult.competitorPrices.map((price, index) => (
                      <div key={index}>• {price}</div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong>Recommendations:</strong>
                <div className="ml-4 mt-1">
                  {quoteResult.recommendations.map((rec, index) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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