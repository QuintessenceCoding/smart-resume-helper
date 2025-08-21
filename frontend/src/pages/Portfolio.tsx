import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { User, Sparkles, Download, Plus, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface for project state within the component
interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

// Interface for the enhanced project data we expect from the backend
interface EnhancedProject {
    projectName: string;
    projectURL?: string;
    projectDescription: string;
    technologies: string;
}

const Portfolio = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
    skills: "",
  });

  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "", description: "", technologies: "", url: "" }
  ]);

  const [generatedPortfolio, setGeneratedPortfolio] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (id: string, field: string, value: string) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: "",
      url: ""
    };
    setProjects(prev => [...prev, newProject]);
  };

  const removeProject = (id: string) => {
    if (projects.length > 1) {
      setProjects(prev => prev.filter(project => project.id !== id));
    }
  };

  // --- HTML TEMPLATE FUNCTION ---
  // This function now takes the final data and generates the HTML string.
  const createPortfolioHTML = (finalData: any) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${finalData.fullName} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800 font-sans">
    <header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-12 text-center">
        <div class="container mx-auto">
            <h1 class="text-5xl font-bold mb-2">${finalData.fullName}</h1>
            <p class="text-2xl opacity-90">${finalData.professionalTitle}</p>
        </div>
    </header>

    <main class="container mx-auto p-8">
        <section id="about" class="mb-16">
            <h2 class="text-4xl font-bold text-center mb-8">About Me</h2>
            <p class="text-center max-w-3xl mx-auto text-lg">${finalData.aboutMe}</p>
        </section>

        <section id="skills" class="mb-16 bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-4xl font-bold text-center mb-8">Skills</h2>
            <div class="flex flex-wrap justify-center gap-4">
                ${finalData.skills.split(',').map((skill: string) => 
                    `<span class="bg-indigo-100 text-indigo-800 text-lg font-medium px-4 py-2 rounded-full">${skill.trim()}</span>`
                ).join('')}
            </div>
        </section>

        <section id="projects">
            <h2 class="text-4xl font-bold text-center mb-8">Projects</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${finalData.projects.map((project: EnhancedProject) => `
                    <div class="bg-white rounded-lg shadow-md p-6 flex flex-col">
                        <h3 class="text-2xl font-bold text-indigo-600 mb-2">${project.projectName}</h3>
                        <p class="text-gray-600 flex-grow mb-4">${project.projectDescription}</p>
                        <div class="mb-4">
                            ${project.technologies.split(',').map((tech: string) => 
                                `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">${tech.trim()}</span>`
                            ).join('')}
                        </div>
                        ${project.projectURL ? `<a href="${project.projectURL}" target="_blank" class="text-indigo-500 hover:text-indigo-700 font-bold self-start">View Project →</a>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    </main>

    <footer class="bg-gray-800 text-white text-center p-8 mt-16">
        <div class="container mx-auto">
            <p class="mb-2">Contact Me</p>
            <p>${finalData.email} | ${finalData.phone}</p>
            <p class="mt-4 text-gray-400">&copy; ${new Date().getFullYear()} ${finalData.fullName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
  };
  
  // CHANGED: This function now calls the backend API
  const generatePortfolio = async () => {
    setIsGenerating(true);
    
    // 1. Prepare the data in the format the backend expects
    const payload = {
        fullName: formData.name,
        professionalTitle: formData.title,
        email: formData.email,
        phone: formData.phone,
        aboutMe: formData.bio,
        skills: formData.skills,
        projects: projects.map(p => ({
            projectName: p.name,
            projectURL: p.url,
            projectDescription: p.description,
            technologies: p.technologies
        }))
    };

    try {
        // 2. Send the data to the backend
        const response = await fetch("http://localhost:8000/portfolio/enhance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const enhancedData = await response.json();
        console.log("Enhanced Portfolio Data:", enhancedData);

        // 3. Generate the final HTML with the enhanced data
        const portfolioHTML = createPortfolioHTML(enhancedData);
        setGeneratedPortfolio(portfolioHTML);

        toast({
            title: "Portfolio generated!",
            description: "Your AI-enhanced portfolio is ready to preview."
        });

    } catch (error) {
        console.error("Error generating portfolio:", error);
        toast({
            title: "Uh oh! Something went wrong.",
            description: "Could not generate the portfolio. Please check the console for errors.",
            variant: "destructive",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const downloadPortfolio = () => {
    const blob = new Blob([generatedPortfolio], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started!",
      description: "portfolio.html is being downloaded."
    });
  };

  const previewPortfolio = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(generatedPortfolio);
      newWindow.document.close();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Build Your{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create a stunning professional portfolio website in minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Portfolio Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Software Developer"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Brief description about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Projects</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                
                {projects.map((project, index) => (
                  <Card key={project.id} className="p-4 border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Project {index + 1}</Label>
                        {projects.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          value={project.name}
                          onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
                          placeholder="Project Name"
                        />
                        <Input
                          value={project.url}
                          onChange={(e) => handleProjectChange(project.id, 'url', e.target.value)}
                          placeholder="Project URL (optional)"
                        />
                      </div>
                      
                      <Textarea
                        value={project.description}
                        onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                        placeholder="Project description..."
                        rows={2}
                      />
                      
                      <Input
                        value={project.technologies}
                        onChange={(e) => handleProjectChange(project.id, 'technologies', e.target.value)}
                        placeholder="Technologies used (comma-separated)"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={generatePortfolio}
                disabled={isGenerating || !formData.name}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Portfolio...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Portfolio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Portfolio Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedPortfolio ? (
                <div className="space-y-4">
                  <div className="border border-border rounded-lg h-96 overflow-auto">
                    <iframe
                      srcDoc={generatedPortfolio}
                      className="w-full h-full border-0"
                      title="Portfolio Preview"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={previewPortfolio} variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Preview
                    </Button>
                    <Button onClick={downloadPortfolio} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill out the form and click "Generate Portfolio" to see your website!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;