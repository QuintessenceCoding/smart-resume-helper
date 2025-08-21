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

export const createCreativeThemeHTML = (data: PortfolioData): string => {
    const projectsHTML = data.projects.map(project => `
        <div class="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-smooth">
            <div class="h-48 bg-gradient-primary relative overflow-hidden">
                <div class="absolute inset-0 bg-black/20"></div>
            </div>
            <div class="p-6">
                <h3 class="text-2xl font-bold text-accent-primary mb-3 group-hover:text-accent-dark transition-smooth">
                    ${project.projectName}
                </h3>
                <p class="text-text-secondary mb-6 leading-relaxed">
                    ${project.projectDescription}
                </p>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${project.technologies.split(',').map(tech => `
                        <span class="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-medium">${tech.trim()}</span>
                    `).join('')}
                </div>
                <div class="flex gap-4">
                    <a href="${project.projectURL || '#'}" target="_blank" class="flex items-center text-accent-primary hover:text-accent-dark transition-smooth font-medium">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        Live Demo
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.fullName} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --background: 0 0% 98%; --foreground: 216 20% 15%;
            --accent-primary: 188 100% 42%; --accent-glow: 188 100% 60%; --accent-dark: 188 100% 30%;
            --card: 0 0% 100%; --card-foreground: 216 20% 15%; --card-border: 0 0% 92%;
            --text-primary: 216 20% 15%; --text-secondary: 216 10% 45%; --text-muted: 216 8% 60%;
            --gradient-primary: linear-gradient(135deg, hsl(188 100% 42%), hsl(188 100% 60%));
            --gradient-subtle: linear-gradient(135deg, hsl(0 0% 98%), hsl(0 0% 95%));
            --gradient-text: linear-gradient(135deg, hsl(188 100% 42%), hsl(188 80% 50%));
            --shadow-soft: 0 4px 20px -4px hsl(188 100% 42% / 0.15);
            --shadow-glow: 0 0 40px hsl(188 100% 60% / 0.3);
            --shadow-card: 0 8px 32px -8px hsl(216 20% 15% / 0.08);
            --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
        .bg-card { background-color: hsl(var(--card)); }
        .bg-accent-primary { background-color: hsl(var(--accent-primary)); }
        .hover\\:bg-accent-dark:hover { background-color: hsl(var(--accent-dark)); }
        .bg-accent-primary\\/10 { background-color: hsl(var(--accent-primary) / 0.1); }
        .text-accent-primary { color: hsl(var(--accent-primary)); }
        .hover\\:text-accent-dark:hover { color: hsl(var(--accent-dark)); }
        .text-text-primary { color: hsl(var(--text-primary)); }
        .text-text-secondary { color: hsl(var(--text-secondary)); }
        .text-text-muted { color: hsl(var(--text-muted)); }
        .border-card-border { border-color: hsl(var(--card-border)); }
        .shadow-card { box-shadow: var(--shadow-card); }
        .shadow-soft { box-shadow: var(--shadow-soft); }
        .hover\\:shadow-glow:hover { box-shadow: var(--shadow-glow); }
        .transition-smooth { transition: var(--transition-smooth); }
        .gradient-text { background: var(--gradient-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; }
        .bg-gradient-primary { background: var(--gradient-primary); }
        .bg-gradient-subtle { background: var(--gradient-subtle); }
    </style>
</head>
<body class="bg-background">
    <header class="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-card-border">
        <nav class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold gradient-text">${data.fullName}</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="text-text-secondary hover:text-accent-primary transition-smooth">Home</a>
                    <a href="#projects" class="text-text-secondary hover:text-accent-primary transition-smooth">Projects</a>
                    <a href="#contact" class="text-text-secondary hover:text-accent-primary transition-smooth">Contact</a>
                </div>
            </div>
        </nav>
    </header>

    <section id="home" class="pt-32 pb-12 px-6 min-h-screen flex items-center">
        <div class="container mx-auto">
            <div class="max-w-4xl">
                <h1 class="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-6">
                    <span class="block text-text-primary">${data.fullName.split(' ')[0]}</span>
                    <span class="block gradient-text">${data.fullName.split(' ').slice(1).join(' ')}</span>
                </h1>
                <div class="mb-8">
                    <p class="text-xl md:text-2xl text-text-secondary mb-4 max-w-2xl">${data.professionalTitle}</p>
                    <p class="text-lg text-text-muted max-w-xl">${data.aboutMe}</p>
                </div>
            </div>
        </div>
    </section>

    <section id="projects" class="py-20 px-6 bg-gradient-subtle">
        <div class="container mx-auto max-w-7xl">
            <div class="text-center mb-16">
                <h2 class="text-5xl md:text-6xl font-black mb-6">
                    <span class="text-text-primary">Featured</span>
                    <span class="gradient-text block">Projects</span>
                </h2>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${projectsHTML}
            </div>
        </div>
    </section>

    <!-- CORRECTED FOOTER SECTION -->
    <footer id="contact" class="bg-slate-900 text-white py-20 px-6">
        <div class="container mx-auto max-w-6xl text-center">
            <h3 class="text-4xl md:text-5xl font-black mb-6 gradient-text">
                Let's Create Something<span class="block">Amazing Together</span>
            </h3>
            <div class="flex justify-center gap-4 mt-8">
                <a href="mailto:${data.email}" class="text-slate-300 hover:text-accent-primary transition-smooth">${data.email}</a>
                <span class="text-slate-400">|</span>
                <a href="tel:${data.phone}" class="text-slate-300 hover:text-accent-primary transition-smooth">${data.phone}</a>
            </div>
            <div class="border-t border-slate-700 mt-16 pt-8 text-slate-400">
                <p>&copy; ${new Date().getFullYear()} ${data.fullName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
};