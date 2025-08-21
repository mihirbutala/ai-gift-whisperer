import { Heart, Users, Globe, Award, TrendingUp, Shield, Sparkles, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";

const About = () => {
  const stats = [
    { number: "2019", label: "Founded", icon: <Award className="h-5 w-5" /> },
    { number: "500+", label: "Indian Companies", icon: <Users className="h-5 w-5" /> },
    { number: "₹50L+", label: "Gifts Processed", icon: <TrendingUp className="h-5 w-5" /> },
    { number: "28", label: "States Covered", icon: <Globe className="h-5 w-5" /> }
  ];

  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Former pharmaceutical executive with 15+ years in Indian healthcare industry",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    },
    {
      name: "Priya Sharma",
      role: "CTO & Co-founder",
      bio: "AI/ML expert specializing in healthcare technology and Indian market solutions",
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    },
    {
      name: "Amit Patel",
      role: "Head of Operations",
      bio: "Supply chain expert with deep knowledge of Indian pharmaceutical regulations",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    },
    {
      name: "Dr. Meera Reddy",
      role: "Medical Advisor",
      bio: "Practicing physician and pharmaceutical industry consultant",
      image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Patient-Centric Approach",
      description: "Every gift recommendation considers the ultimate goal of better patient care in India",
      gradient: "bg-gradient-primary"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Ethical Compliance",
      description: "Strict adherence to Indian pharmaceutical regulations and ethical guidelines",
      gradient: "bg-gradient-accent"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Innovation First",
      description: "Leveraging cutting-edge AI to solve real problems in Indian healthcare gifting",
      gradient: "bg-gradient-futuristic"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Focus",
      description: "Building stronger relationships within the Indian pharmaceutical community",
      gradient: "bg-gradient-primary"
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Company Founded",
      description: "Started with a vision to revolutionize pharmaceutical gifting in India"
    },
    {
      year: "2020",
      title: "AI Platform Launch",
      description: "Launched our first AI-powered gift recommendation system"
    },
    {
      year: "2021",
      title: "Pan-India Expansion",
      description: "Extended services to all 28 Indian states and 8 union territories"
    },
    {
      year: "2022",
      title: "500+ Companies",
      description: "Reached milestone of serving 500+ pharmaceutical companies"
    },
    {
      year: "2023",
      title: "Advanced Analytics",
      description: "Introduced market intelligence and pricing analytics"
    },
    {
      year: "2024",
      title: "Enterprise Solutions",
      description: "Launched enterprise-grade solutions for large pharmaceutical corporations"
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
                <Heart className="h-4 w-4" />
                Made in India, for India
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Transforming{" "}
                <span className="bg-gradient-futuristic bg-clip-text text-transparent animate-gradient">
                  Indian Healthcare
                </span>{" "}
                Through AI
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We're on a mission to revolutionize pharmaceutical gifting in India by combining artificial intelligence with deep understanding of Indian healthcare culture and regulations.
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

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Our Story
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Founded in 2019 by a team of pharmaceutical industry veterans and AI experts, GiftAI Pro was born from a simple observation: pharmaceutical gifting in India was stuck in the past.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We saw companies struggling with compliance, spending hours researching appropriate gifts, and missing opportunities to build meaningful relationships with healthcare professionals. Our founders, having worked in the Indian pharmaceutical industry for decades, understood these pain points intimately.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we're proud to serve over 500 pharmaceutical companies across India, processing millions of rupees worth of gifts while ensuring complete compliance with Indian regulations and cultural sensitivity.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 animate-float">
                <img
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                  alt="Indian pharmaceutical team"
                  className="rounded-2xl shadow-futuristic w-full h-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-futuristic opacity-30 rounded-2xl blur-3xl scale-110 animate-pulse-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 glass-effect">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do in serving the Indian pharmaceutical community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8 shadow-futuristic border-0 glass-effect hover:shadow-primary transition-all duration-500 hover:scale-[1.02] text-center">
                <div className="space-y-4">
                  <div className={`p-4 ${value.gradient} rounded-xl animate-pulse-glow text-primary-foreground w-fit mx-auto`}>
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals with deep expertise in Indian pharmaceutical industry and cutting-edge technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 shadow-futuristic border-0 glass-effect hover:shadow-accent transition-all duration-500 hover:scale-[1.02] text-center">
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover shadow-medium"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <Badge variant="outline" className="text-xs bg-accent-soft border-accent/20 mb-2">
                      {member.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 glass-effect">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our mission to transform pharmaceutical gifting in India.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-futuristic rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm animate-pulse-glow">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <Card className="flex-1 p-6 shadow-soft border-border/50 glass-effect">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs bg-success/10 border-success/20 text-success">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-lg font-semibold text-foreground">{milestone.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our platform or want to learn more? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center shadow-futuristic border-0 glass-effect hover:shadow-primary transition-all duration-500">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-primary rounded-xl animate-pulse-glow text-primary-foreground w-fit mx-auto">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Visit Us</h3>
                  <p className="text-sm text-muted-foreground">
                    Tech Park, Bangalore<br />
                    Karnataka, India 560001
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 text-center shadow-futuristic border-0 glass-effect hover:shadow-accent transition-all duration-500">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-accent rounded-xl animate-pulse-glow text-accent-foreground w-fit mx-auto">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                  <p className="text-sm text-muted-foreground">
                    +91 80 4567 8900<br />
                    Mon-Fri, 9 AM - 6 PM IST
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 text-center shadow-futuristic border-0 glass-effect hover:shadow-futuristic transition-all duration-500">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-futuristic rounded-xl animate-pulse-glow text-primary-foreground w-fit mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                  <p className="text-sm text-muted-foreground">
                    hello@giftaipro.in<br />
                    support@giftaipro.in
                  </p>
                </div>
              </div>
            </Card>
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
                  Ready to Join Our Mission?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Be part of the revolution in Indian pharmaceutical gifting. Start your journey with us today.
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
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;