import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, DollarSign, TrendingUp, FileText, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { geminiService } from "@/services/gemini";
import { toast } from "@/components/ui/sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    setIsAnalyzing(true);
    setError(null);
    setQuoteResult(null);
    
    try {
      console.log('Starting product analysis...');
      console.log('Has image:', !!uploadedImage);
      console.log('Has description:', !!productDescription.trim());
      
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
          variant="accent"
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              AI is analyzing...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              Generate Quote
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

          <Card className="p-4 shadow-soft border-border/50 bg-background/60 backdrop-blur-sm">
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{quoteResult.productName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">AI-analyzed product</p>
                    <Badge variant="outline" className="text-xs bg-accent-soft border-accent/20">
                      {quoteResult.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 border-success/20 text-success">
                  {quoteResult.confidence}% confidence
                </Badge>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{quoteResult.suggestedPrice}</div>
                  <div className="text-xs text-muted-foreground">Suggested Price (INR)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-success">{quoteResult.marketComparison}</div>
                  <div className="text-xs text-muted-foreground">vs. Indian Market Average</div>
                </div>
              </div>

              {/* Features */}
              {quoteResult.features.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Sparkles className="h-3 w-3" />
                    Key Features
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {quoteResult.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitor Prices */}
              {quoteResult.competitorPrices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Market Comparison
                  </div>
                  <div className="space-y-1">
                    {quoteResult.competitorPrices.map((price, index) => (
                      <div key={index} className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
                        {price}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <FileText className="h-3 w-3" />
                  Recommendations
                </div>
                <div className="space-y-1">
                  {quoteResult.recommendations.map((rec, index) => (
                    <div key={index} className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Getting Started Help */}
      {!quoteResult && !error && (
        <Card className="p-4 bg-muted/30 border-border/30">
          <div className="text-center space-y-2">
            <ImageIcon className="h-8 w-8 text-accent mx-auto" />
            <h4 className="text-sm font-medium text-foreground">Get instant competitive pricing</h4>
            <p className="text-xs text-muted-foreground">
              Upload product images or add descriptions to receive Gemini AI-powered Indian market analysis and INR pricing recommendations
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};