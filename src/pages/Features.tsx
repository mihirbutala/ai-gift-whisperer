import { Sparkles, Search, Upload, TrendingUp, Shield, Globe, Users, Zap, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";

const Features = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "AI-Powered Gift Discovery",
      description: "Advanced AI algorithms analyze your requirements and suggest perfect gifts for Indian pharmaceutical professionals",
      benefits: ["Personalized recommendations", "Cultural context awareness", "Industry-specific suggestions"],
      gradient: "bg-gradient-primary"
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Instant INR Pricing",
      description: "Get competitive quotes in Indian Rupees with real-time market analysis and GST calculations",
      benefits: ["Real-time pricing", "GST compliance", "Bulk discount calculations"],
      gradient: "bg-gradient-accent"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Market Intelligence",
      description: "Access comprehensive Indian pharmaceutical market data and pricing trends",
      benefits: ["Market trend analysis", "Competitive pricing", "Regional variations"],
      gradient: "bg-gradient-futuristic"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Compliance Assurance",
      description: "Ensure all gifts meet Indian pharmaceutical regulations and ethical guidelines",
      benefits: ["Regulatory compliance", "Ethical guidelines", "Documentation support"],
      gradient: "bg-gradient-primary"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Pan-India Coverage",
      description: "Comprehensive coverage across all Indian states with local supplier networks",
      benefits: ["All-India delivery", "Local suppliers", "Regional customization"],
      gradient: "bg-gradient-accent"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Bulk Management",
      description: "Efficiently manage large-scale gifting campaigns for conferences and events",
      benefits: ["Bulk ordering", "Event management", "Custom branding"],
      gradient: "bg-gradient-futuristic"
    }
  ];

  const stats = [
    { number: "500+", label: "Indian Companies", icon: <Users className="h-5 w-5" /> },
    { number: "₹50L+", label: "Gifts Processed", icon: <TrendingUp className="h-5 w-5" /> },
    { number: "28", label: "Indian States", icon: <Globe className="h-5 w-5" /> },
    { number: "99.9%", label: "Uptime", icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-glow">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 glass-effect text-accent px-6 py-3 rounded-full text-sm font-medium animate-pulse-glow">
                <Sparkles className="h-4 w-4" />
                Advanced AI Features
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Powerful Features for{" "}
                <span className="bg-gradient-futuristic bg-clip-text text-transparent animate-gradient">
                  Indian Pharmaceutical Gifting
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Discover how our AI-powered platform revolutionizes pharmaceutical gifting in India with intelligent recommendations, competitive INR pricing, and comprehensive market insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 glass-effect">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center shadow-futuristic border-0 glass-effect hover:shadow-primary transition-all duration-500">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-futuristic rounded-xl animate-pulse-glow text-primary-foreground">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Indian Pharmaceutical Gifting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and insights needed for successful pharmaceutical gifting in the Indian market.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 shadow-futuristic border-0 glass-effect hover:shadow-primary transition-all duration-500 hover:scale-[1.02] group">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 ${feature.gradient} rounded-xl animate-pulse-glow text-primary-foreground group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-glow">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="p-12 text-center shadow-futuristic border-0 glass-effect">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Ready to Transform Your Pharmaceutical Gifting?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join 500+ Indian pharmaceutical companies already using our AI-powered platform for smarter, more effective gifting strategies.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="group px-12 py-6 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                </Button>
                <Button variant="accent" size="lg" className="group px-12 py-6 text-lg font-semibold">
                  <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Schedule Demo
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent" />
                <span>No credit card required • 14-day free trial</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Features;