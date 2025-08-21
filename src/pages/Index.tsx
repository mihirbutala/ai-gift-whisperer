import { Search, Upload, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { AIGiftSearch } from "@/components/AIGiftSearch";
import { ProductQuote } from "@/components/ProductQuote";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-accent-soft text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Gifting Solutions
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Revolutionize Your{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Pharmaceutical Gifting
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Discover personalized gift ideas and get competitive quotes instantly with our AI-driven platform designed specifically for pharmaceutical professionals.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group">
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start AI Search
                </Button>
                <Button variant="accent" size="lg" className="group">
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Get Quote
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  <span>Trusted by 500+ companies</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>AI-powered recommendations</div>
              </div>
            </div>
            
            <div className="lg:order-2 relative">
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="AI Gifting Platform Dashboard"
                  className="rounded-2xl shadow-medium w-full h-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-3xl scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Gifting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform streamlines your gifting process with intelligent search and competitive pricing.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* AI Gift Search */}
            <Card className="p-8 shadow-soft border-0 bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-primary rounded-xl">
                  <Search className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">AI Gift Ideas</h3>
                  <p className="text-muted-foreground">Pharmaceutical-focused recommendations</p>
                </div>
              </div>
              <AIGiftSearch />
            </Card>
            
            {/* Product Quote */}
            <Card className="p-8 shadow-soft border-0 bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-accent rounded-xl">
                  <Upload className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Product Quotes</h3>
                  <p className="text-muted-foreground">Instant competitive pricing</p>
                </div>
              </div>
              <ProductQuote />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;