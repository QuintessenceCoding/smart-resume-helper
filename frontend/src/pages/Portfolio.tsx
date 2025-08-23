import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { User, Sparkles, Download, Plus, Trash2, Eye, Paintbrush, Save, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { createMinimalistThemeHTML } from "@/themes/MinimalistTheme";
import { createTechThemeHTML } from "@/themes/TechTheme";
import { createCreativeThemeHTML } from "@/themes/CreativeTheme";

// --- Interfaces ---
interface Project { id: string; name: string; description: string; technologies: string; url: string; }
interface EnhancedProject { projectName: string; projectURL?: string; projectDescription: string; technologies: string; }
interface PortfolioDataObject { fullName: string; professionalTitle: string; email: string; phone: string; aboutMe: string; skills: string; projects: EnhancedProject[]; }
interface SavedPortfolioInfo { id: number; fullName: string; }

const Portfolio = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", title: "", bio: "", skills: "" });
  const [projects, setProjects] = useState<Project[]>([{ id: "1", name: "", description: "", technologies: "", url: "" }]);
  const [generatedPortfolio, setGeneratedPortfolio] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState('minimalist');
  const [enhancedDataToSave, setEnhancedDataToSave] = useState<PortfolioDataObject | null>(null);
  const [savedPortfolios, setSavedPortfolios] = useState<SavedPortfolioInfo[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Handler Functions ---
  const handleInputChange = (field: string, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };
  const handleProjectChange = (id: string, field: string, value: string) => { setProjects(prev => prev.map(project => project.id === id ? { ...project, [field]: value } : project)); };
  const addProject = () => { const newProject: Project = { id: Date.now().toString(), name: "", description: "", technologies: "", url: "" }; setProjects(prev => [...prev, newProject]); };
  const removeProject = (id: string) => { if (projects.length > 1) { setProjects(prev => prev.filter(project => project.id !== id)); } };
  const downloadPortfolio = () => { const blob = new Blob([generatedPortfolio], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'portfolio.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast({ title: "Download started!", description: "portfolio.html is being downloaded." }); };
  const previewPortfolio = () => { const newWindow = window.open('', '_blank'); if (newWindow) { newWindow.document.write(generatedPortfolio); newWindow.document.close(); } };
  const createPortfolioHTML = (finalData: any) => { switch (selectedTheme) { case 'minimalist': return createMinimalistThemeHTML(finalData); case 'tech': return createTechThemeHTML(finalData); case 'creative': return createCreativeThemeHTML(finalData); default: return createMinimalistThemeHTML(finalData); } };
  
  const generatePortfolio = async () => {
    setIsGenerating(true);
    setEnhancedDataToSave(null);
    const payload = { fullName: formData.name, professionalTitle: formData.title, email: formData.email, phone: formData.phone, aboutMe: formData.bio, skills: formData.skills, projects: projects.map(p => ({ projectName: p.name, projectURL: p.url, projectDescription: p.description, technologies: p.technologies })) };
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/portfolio/enhance`;
      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const enhancedData = await response.json();
      setEnhancedDataToSave(enhancedData);
      const portfolioHTML = createPortfolioHTML(enhancedData);
      setGeneratedPortfolio(portfolioHTML);
      toast({ title: "Portfolio generated!", description: "Your AI-enhanced portfolio is ready to preview and save." });
    } catch (error) {
      console.error("Error generating portfolio:", error);
      toast({ title: "Error", description: "Could not generate portfolio.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // EDITED: Added logic to send the authentication token
  const handleSavePortfolio = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({ title: "Authentication Error", description: "You must be logged in to save a portfolio.", variant: "destructive" });
      return;
    }
    if (!enhancedDataToSave) {
      toast({ title: "Nothing to save", description: "Please generate a portfolio first.", variant: "destructive" });
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/portfolio/save`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // This sends the token
        },
        body: JSON.stringify(enhancedDataToSave),
      });

      if (!response.ok) { throw new Error("Failed to save portfolio.") }

      toast({ title: "Portfolio Saved!", description: "Your portfolio has been saved to your account." });
    } catch (error) {
      console.error("Error saving portfolio:", error);
      toast({ title: "Save Failed", description: "Could not save the portfolio.", variant: "destructive" });
    }
  };

  // EDITED: Added logic to send the authentication token
  const fetchSavedPortfolios = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({ title: "Not Logged In", description: "Please log in to view saved portfolios.", variant: "destructive" });
      setIsModalOpen(false); // Close the modal if not logged in
      return;
    }
    
    setIsLoadingPortfolios(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/portfolios/`;
      const response = await fetch(apiUrl, {
        headers: { "Authorization": `Bearer ${token}` } // This sends the token
      });
      if (!response.ok) { throw new Error("Failed to fetch portfolios.") }
      const data: SavedPortfolioInfo[] = await response.json();
      setSavedPortfolios(data);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      toast({ title: "Error", description: "Could not fetch saved portfolios.", variant: "destructive" });
    } finally {
      setIsLoadingPortfolios(false);
    }
  };

  // EDITED: Added logic to send the authentication token
  const loadPortfolioData = async (portfolioId: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({ title: "Not Logged In", description: "Please log in to load a portfolio.", variant: "destructive" });
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/portfolios/${portfolioId}`;
      const response = await fetch(apiUrl, {
        headers: { "Authorization": `Bearer ${token}` } // This sends the token
      });
      if (!response.ok) { throw new Error("Failed to load portfolio.") }
      const data: PortfolioDataObject = await response.json();
      
      setFormData({
          name: data.fullName, email: data.email, phone: data.phone,
          title: data.professionalTitle, bio: data.aboutMe, skills: data.skills,
      });
      setProjects(data.projects.map((p, index) => ({
          id: Date.now().toString() + index, name: p.projectName,
          description: p.projectDescription, technologies: p.technologies, url: p.projectURL || ""
      })));

      setIsModalOpen(false);
      setGeneratedPortfolio("");
      setEnhancedDataToSave(null);
      toast({ title: "Portfolio Loaded", description: `Loaded portfolio for ${data.fullName}.` });

    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast({ title: "Error", description: "Could not load the selected portfolio.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">Build Your <span className="bg-gradient-hero bg-clip-text text-transparent">Portfolio</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Create a stunning professional portfolio website in minutes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2"><User className="h-5 w-5" /><span>Portfolio Information</span></CardTitle>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={fetchSavedPortfolios}>
                      <FolderOpen className="h-4 w-4 mr-2" />Load
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Load Saved Portfolio</DialogTitle>
                      <DialogDescription>Select a previously saved portfolio to continue editing.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-80 overflow-y-auto">
                      {isLoadingPortfolios ? (<p>Loading...</p>) : savedPortfolios.length > 0 ? (
                        <ul className="space-y-2">
                          {savedPortfolios.map(p => (
                            <li key={p.id}>
                              <Button variant="ghost" className="w-full justify-start" onClick={() => loadPortfolioData(p.id)}>
                                Portfolio for {p.fullName} (ID: {p.id})
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (<p className="text-muted-foreground">No saved portfolios found.</p>)}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center text-sm font-medium"><Paintbrush className="h-4 w-4 mr-2" />Choose Your Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant={selectedTheme === 'minimalist' ? 'default' : 'outline'} onClick={() => setSelectedTheme('minimalist')}>Minimalist</Button>
                  <Button variant={selectedTheme === 'tech' ? 'default' : 'outline'} onClick={() => setSelectedTheme('tech')}>Tech</Button>
                  <Button variant={selectedTheme === 'creative' ? 'default' : 'outline'} onClick={() => setSelectedTheme('creative')}>Creative</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="MS Dhoni"/></div>
                <div className="space-y-2"><Label htmlFor="title">Professional Title</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Software Developer"/></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Dhoni@example.com"/></div>
                <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+91 12345 67890"/></div>
              </div>
              <div className="space-y-2"><Label htmlFor="bio">About Me</Label><Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} placeholder="Brief description about yourself..." rows={4}/></div>
              <div className="space-y-2"><Label htmlFor="skills">Skills (comma-separated)</Label><Input id="skills" value={formData.skills} onChange={(e) => handleInputChange('skills', e.target.value)} placeholder="JavaScript, React, Node.js, Python"/></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><Label>Projects</Label><Button type="button" variant="outline" size="sm" onClick={addProject}><Plus className="h-4 w-4 mr-2" />Add Project</Button></div>
                {projects.map((project, index) => (<Card key={project.id} className="p-4 border-border/30"><div className="space-y-3"><div className="flex items-center justify-between"><Label className="text-sm font-medium">Project {index + 1}</Label>{projects.length > 1 && (<Button type="button" variant="ghost" size="sm" onClick={() => removeProject(project.id)}><Trash2 className="h-4 w-4" /></Button>)}</div><div className="grid md:grid-cols-2 gap-3"><Input value={project.name} onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)} placeholder="Project Name"/><Input value={project.url} onChange={(e) => handleProjectChange(project.id, 'url', e.target.value)} placeholder="Project URL (optional)"/></div><Textarea value={project.description} onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)} placeholder="Project description..." rows={2}/><Input value={project.technologies} onChange={(e) => handleProjectChange(project.id, 'technologies', e.target.value)} placeholder="Technologies used (comma-separated)"/></div></Card>))}
              </div>
              <Button onClick={generatePortfolio} disabled={isGenerating || !formData.name} className="w-full">{isGenerating ? (<><Sparkles className="h-4 w-4 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="h-4 w-4 mr-2" />Generate Portfolio</>)}</Button>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader><CardTitle className="flex items-center space-x-2"><Eye className="h-5 w-5" /><span>Portfolio Preview</span></CardTitle></CardHeader>
            <CardContent>{generatedPortfolio ? (<div className="space-y-4"><div className="border border-border rounded-lg h-96 overflow-auto"><iframe srcDoc={generatedPortfolio} className="w-full h-full border-0" title="Portfolio Preview"/></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Button onClick={previewPortfolio} variant="outline" className="flex-1"><Eye className="h-4 w-4 mr-2" />Open Preview</Button><Button onClick={downloadPortfolio} variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Download</Button><Button onClick={handleSavePortfolio} className="flex-1"><Save className="h-4 w-4 mr-2" />Save Portfolio</Button></div></div>) : (<div className="text-center py-12 text-muted-foreground"><User className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Fill out the form and click "Generate Portfolio" to see your website!</p></div>)}</CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;