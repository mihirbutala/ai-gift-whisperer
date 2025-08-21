import { Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ProductQuote } from "@/components/ProductQuote";
import { Link } from "react-router-dom";

const ProductQuotePage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-accent rounded-xl">
                  <Upload className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Product Quote
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload product images or descriptions to get instant competitive pricing in INR
              </p>
            </div>
          </div>

          {/* Product Quote Component */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-effect p-8 rounded-2xl shadow-futuristic">
              <ProductQuote />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductQuotePage;