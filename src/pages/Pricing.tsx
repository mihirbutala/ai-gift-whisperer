import { Check, Star, Zap, Crown, Users, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "₹2,999",
      period: "/month",
      description: "Perfect for small pharmaceutical companies and startups",
      icon: <Zap className="h-6 w-6" />,
      gradient: "bg-gradient-primary",
      popular: false,
      features: [
        "Up to 100 AI gift searches per month",
        "Basic INR pricing analysis",
        "Email support",
        "GST compliant invoicing",
        "Access to Indian supplier network",
        "Basic market insights",
        "Standard delivery tracking"
      ],
      limits: [
        "100 searches/month",
        "Basic support",
        "Standard features"
      ]
    },
    {
      name: "Professional",
      price: "₹7,999",
      period: "/month",
      description: "Ideal for growing pharmaceutical businesses",
      icon: <Star className="h-6 w-6" />,
      gradient: "bg-gradient-accent",
      popular: true,
      features: [
        "Up to 500 AI gift searches per month",
        "Advanced market intelligence",
        "Priority support (24/7)",
        "Custom branding options",
        "Bulk order management",
        "Regional pricing variations",
        "Advanced analytics dashboard",
        "API access for integrations",
        "Dedicated account manager"
      ],
      limits: [
        "500 searches/month",
        "Priority support",
        "Advanced features"
      ]
    },
    {
      name: "Enterprise",
      price: "₹19,999",
      period: "/month",
      description: "For large pharmaceutical corporations and enterprises",
      icon: <Crown className="h-6 w-6" />,
      gradient: "bg-gradient-futuristic",
      popular: false,
      features: [
        "Unlimited AI gift searches",
        "Complete market intelligence suite",
        "White-label solutions",
        "Custom integrations",
        "Multi-location management",
        "Advanced compliance tools",
        "Real-time inventory tracking",
        "Custom reporting & analytics",
        "Dedicated success team",
        "SLA guarantees",
        "Training & onboarding"
      ],
      limits: [
        "Unlimited usage",
        "Premium support",
        "All features included"
      ]
    }
  ];

  const addOns = [
    {
      name: "Additional AI Searches",
      price: "₹5",
      unit: "per search",
      description: "Extra searches beyond your plan limit"
    },
    {
      name: "Custom Branding",
      price: "₹4,999",
      unit: "one-time",
      description: "White-label the platform with your company branding"
    },
    {
      name: "Advanced Analytics",
      price: "₹1,999",
      unit: "/month",
      description: "Detailed insights and custom reporting"
    },
    {
      name: "Priority Support",
      price: "₹2,499",
      unit: "/month",
      description: "24/7 priority support with dedicated manager"
    }
  ];

  const faqs = [
    {
      question: "Are prices inclusive of GST?",
      answer: "All prices are exclusive of GST. 18% GST will be added as per Indian tax regulations."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "Do you offer discounts for annual payments?",
      answer: "Yes, we offer 20% discount on annual payments. Contact our sales team for custom enterprise pricing."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major Indian payment methods including UPI, Net Banking, Credit/Debit cards, and bank transfers."
    }
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
                <TrendingUp className="h-4 w-4" />
                Transparent Indian Pricing
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Choose Your{" "}
                <span className="bg-gradient-futuristic bg-clip-text text-transparent animate-gradient">
                  Perfect Plan
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Flexible pricing plans designed for Indian pharmaceutical companies of all sizes. All prices in INR with GST compliance and local payment methods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`p-8 shadow-futuristic border-0 glass-effect hover:shadow-primary transition-all duration-500 hover:scale-[1.02] relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-accent text-accent-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className={`p-4 ${plan.gradient} rounded-xl animate-pulse-glow text-primary-foreground w-fit mx-auto`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">+ 18% GST</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">What's included:</h4>
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    variant={plan.popular ? "accent" : "hero"} 
                    className="w-full py-6 text-lg font-semibold"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 glass-effect">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Add-ons & Extras
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enhance your plan with additional features and services tailored for Indian pharmaceutical businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <Card key={index} className="p-6 shadow-futuristic border-0 glass-effect hover:shadow-accent transition-all duration-500">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{addon.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-accent">{addon.price}</span>
                    <span className="text-sm text-muted-foreground">{addon.unit}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Common questions about our pricing and billing for Indian customers.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 shadow-soft border-border/50 glass-effect">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">{faq.question}</h4>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Start your 14-day free trial today. No credit card required. Experience the power of AI-driven pharmaceutical gifting.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="group px-12 py-6 text-lg font-semibold">
                  <Star className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                </Button>
                <Button variant="accent" size="lg" className="group px-12 py-6 text-lg font-semibold">
                  <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Contact Sales
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>GST Compliant</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Indian Payment Methods</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Pricing;