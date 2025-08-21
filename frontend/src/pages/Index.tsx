import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FileText, User, Zap, Download, Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart Resume Analysis",
      description: "Upload your resume and get AI-powered insights and improvements"
    },
    {
      icon: Sparkles,
      title: "AI Enhancement",
      description: "Let AI optimize your resume content for better job opportunities"
    },
    {
      icon: User,
      title: "Portfolio Builder",
      description: "Create a professional portfolio website in minutes"
    },
    {
      icon: Download,
      title: "Export & Download",
      description: "Download your enhanced resume and portfolio in multiple formats"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  AI-Powered{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Resume & Portfolio
                  </span>{" "}
                  Helper
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transform your career prospects with AI-enhanced resumes and stunning portfolios. 
                  Upload, optimize, and export professional documents that stand out.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="group">
                  <Link to="/resume" className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Upload Resume</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="group">
                  <Link to="/portfolio" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Try Portfolio Builder</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-3xl" />
              <img 
                src={heroImage} 
                alt="AI Resume and Portfolio Helper" 
                className="relative rounded-2xl shadow-elegant w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Everything You Need to{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to elevate your professional presence and land your dream job
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-smooth hover:shadow-glow">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-smooth" />
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-bounce">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-hero opacity-10" />
            <CardContent className="relative p-8 lg:p-12 text-center space-y-6">
              <div className="flex justify-center">
                <Zap className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to Boost Your Career?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who have enhanced their resumes and built stunning portfolios with our AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="group">
                  <Link to="/resume" className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;