// src/themes/TechTheme.ts

interface Project {
    projectName: string;
    projectURL?: string;
    projectDescription: string;
    technologies: string;
}

interface PortfolioData {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    aboutMe: string;
    skills: string;
    projects: Project[];
}

export const createTechThemeHTML = (data: PortfolioData): string => {
    const projectsHTML = data.projects.map(project => `
        <div class="glow-card bg-card border-border hover:border-primary/50 transition-all duration-300 rounded-lg overflow-hidden">
            <div class="p-6">
                <h3 class="text-xl font-semibold text-card-foreground mb-2">${project.projectName}</h3>
                <p class="text-muted-foreground leading-relaxed mb-4">${project.projectDescription}</p>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${project.technologies.split(',').map(tech => `
                        <span class="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">${tech.trim()}</span>
                    `).join('')}
                </div>
                <div class="flex gap-3">
                    <a href="${project.projectURL || '#'}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors">
                        Live Demo
                    </a>
                    <!-- Assuming a generic GitHub URL for now, can be customized if needed -->
                    <a href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.fullName} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --background: 225 15% 6%; --foreground: 210 40% 96%;
            --card: 225 15% 8%; --card-foreground: 210 40% 96%;
            --popover: 225 15% 8%; --popover-foreground: 210 40% 96%;
            --primary: 195 100% 50%; --primary-foreground: 225 15% 6%;
            --secondary: 270 95% 75%; --secondary-foreground: 225 15% 6%;
            --muted: 225 15% 12%; --muted-foreground: 210 40% 70%;
            --accent: 195 100% 50%; --accent-foreground: 225 15% 6%;
            --destructive: 0 84.2% 60.2%; --destructive-foreground: 210 40% 98%;
            --border: 225 15% 15%; --input: 225 15% 12%; --ring: 195 100% 50%;
            --radius: 0.75rem;
            --gradient-primary: 195 100% 50%; --gradient-secondary: 270 95% 75%;
            --glow-primary: 195 100% 50%; --glow-secondary: 270 95% 75%;
            --shadow-glow: 0 0 20px hsl(var(--glow-primary) / 0.3);
            --shadow-card: 0 4px 20px hsl(225 15% 2% / 0.5);
        }
        body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
        .bg-card { background-color: hsl(var(--card)); }
        .text-primary { color: hsl(var(--primary)); }
        .bg-primary { background-color: hsl(var(--primary)); }
        .text-primary-foreground { color: hsl(var(--primary-foreground)); }
        .bg-primary\\/10 { background-color: hsl(var(--primary) / 0.1); }
        .bg-primary\\/20 { background-color: hsl(var(--primary) / 0.2); }
        .hover\\:bg-primary\\/90:hover { background-color: hsl(var(--primary) / 0.9); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .bg-muted { background-color: hsl(var(--muted)); }
        .hover\\:bg-muted:hover { background-color: hsl(var(--muted)); }
        .border-border { border-color: hsl(var(--border)); }
        .border-primary\\/50 { border-color: hsl(var(--primary) / 0.5); }
        .hover\\:border-primary:hover { border-color: hsl(var(--primary)); }
        .gradient-text { background-image: linear-gradient(to right, hsl(var(--gradient-primary)), hsl(var(--gradient-secondary))); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .glow-card { box-shadow: var(--shadow-card); transition: all 0.3s ease; }
        .glow-card:hover { box-shadow: var(--shadow-glow), var(--shadow-card); transform: translateY(-2px); }
        .nav-blur { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
    </style>
</head>
<body class="min-h-screen bg-background text-foreground">
    <header class="fixed top-0 left-0 right-0 z-50 nav-blur bg-background/80 border-b border-border">
        <nav class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="text-xl font-bold gradient-text">${data.fullName.split(' ').map(n => n[0]).join('')}</div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#hero" class="text-muted-foreground hover:text-primary transition-colors duration-200">Home</a>
                    <a href="#projects" class="text-muted-foreground hover:text-primary transition-colors duration-200">Projects</a>
                    <a href="#contact" class="text-muted-foreground hover:text-primary transition-colors duration-200">Contact</a>
                </div>
                <a href="#contact" class="hidden sm:inline-block px-4 py-2 text-sm border-primary/50 hover:bg-primary/10 hover:border-primary text-primary border rounded-md">Get In Touch</a>
            </div>
        </nav>
    </header>

    <main>
        <section id="hero" class="min-h-screen flex items-center justify-center px-6 pt-20">
            <div class="container mx-auto text-center max-w-4xl">
                <div class="space-y-8">
                    <h1 class="text-5xl md:text-7xl font-bold leading-tight">Hi, I'm <span class="gradient-text">${data.fullName}</span></h1>
                    <h2 class="text-2xl md:text-3xl text-muted-foreground font-light">${data.professionalTitle}</h2>
                    <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">${data.aboutMe}</p>
                </div>
            </div>
        </section>

        <section id="projects" class="py-20 px-6">
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-6">Featured <span class="gradient-text">Projects</span></h2>
                    <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Explore my recent work showcasing innovative solutions and cutting-edge technologies</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${projectsHTML}
                </div>
            </div>
        </section>
    </main>

    <footer id="contact" class="bg-card border-t border-border py-16 px-6">
        <div class="container mx-auto max-w-4xl">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Let's Build Something <span class="gradient-text">Amazing</span></h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div class="space-y-4">
                    <div class="flex items-center space-x-3 text-muted-foreground"><span class="text-primary">📧</span><span>${data.email}</span></div>
                    <div class="flex items-center space-x-3 text-muted-foreground"><span class="text-primary">📞</span><span>${data.phone}</span></div>
                </div>
                <div class="flex items-center justify-center md:justify-end space-x-4">
                    <a href="#" class="text-muted-foreground hover:text-primary">GitHub</a>
                    <a href="#" class="text-muted-foreground hover:text-primary">LinkedIn</a>
                </div>
            </div>
            <div class="border-t border-border pt-8 text-center">
                <p class="text-muted-foreground">© 2024 ${data.fullName}. Built with React, TypeScript, and Tailwind CSS.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
};