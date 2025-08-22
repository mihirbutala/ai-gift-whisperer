import { Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Minimal Hero Section */}
      <section className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              supergifter.ai
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-Powered Pharmaceutical Gifting Platform for India
            </p>
          </div>
          
          {/* Two Main Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/ai-search">
              <Button variant="hero" size="lg" className="px-12 py-6 text-lg font-semibold min-w-[200px]">
                <Search className="h-6 w-6" />
                AI Gift Search
              </Button>
            </Link>
            
            <Link to="/product-quote">
              <Button variant="accent" size="lg" className="px-12 py-6 text-lg font-semibold min-w-[200px]">
                <Upload className="h-6 w-6" />
                Product Quote
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Supabase Connection Test - Remove this in production */}
        <div className="mt-16 max-w-2xl mx-auto">
          <SupabaseConnectionTest />
        </div>
      </section>
    </div>
  );
};

export default Index;