import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Upload, Sparkles, Download, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Import ReactMarkdown and its plugin
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Resume = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setEnhancedText("");
      toast({
        title: "File selected!",
        description: `${file.name} is ready to be enhanced.`,
      });
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a resume file first.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    const formData = new FormData();
    formData.append("resume_file", uploadedFile);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/resume/enhance`;
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.enhanced_text) {
        setEnhancedText(result.enhanced_text);
        toast({
          title: "Enhancement successful!",
          description: "Your resume has been enhanced by AI.",
        });
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error enhancing resume:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Could not connect to the backend or an error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) {
      toast({
        title: "Nothing to download",
        description: "The enhanced resume content is empty.",
        variant: "destructive",
      });
      return;
    }
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started!",
      description: `${filename} is being downloaded.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Enhance Your{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Resume
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and let AI transform it into a compelling, professional document
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload & Enhance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer space-y-4 block">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Drop your resume here or click to browse</p>
                    <p className="text-muted-foreground">Supports PDF, DOCX, and TXT files</p>
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-accent rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                  <Button
                    onClick={handleEnhanceWithAI}
                    disabled={isEnhancing}
                    className="w-full"
                  >
                    {isEnhancing ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Resume Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Enhanced Resume</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedText ? (
                <div className="space-y-4">
                  {/* This 'div' and the '<ReactMarkdown>' component are the key changes */}
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md min-h-[400px] bg-background">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {enhancedText}
                    </ReactMarkdown>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleDownload(enhancedText, 'enhanced-resume.md')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Markdown
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a resume and click "Enhance with AI" to see the magic happen!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Resume;