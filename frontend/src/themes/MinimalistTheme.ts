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

export const createMinimalistThemeHTML = (data: PortfolioData): string => {
    // Dynamically generate the project cards HTML
    const projectsHTML = data.projects.map(project => `
        <div class="surface shadow-card rounded-lg p-8 hover-lift">
            <h3 class="heading-md mb-4">${project.projectName}</h3>
            <p class="body-base mb-6">${project.projectDescription}</p>
            <div class="flex flex-wrap gap-2 mb-6">
                ${project.technologies.split(',').map(tech => `
                    <span class="px-3 py-1 text-sm bg-primary-muted text-primary rounded-full">${tech.trim()}</span>
                `).join('')}
            </div>
            <a href="${project.projectURL || '#'}" target="_blank" class="inline-flex items-center text-primary hover:text-accent-hover font-medium transition-colors duration-200">
                View Project
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        </div>
    `).join('');

    // The main HTML template string
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.fullName} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Injected CSS from your index.css file */
        @layer base {
            :root {
                --background: 0 0% 98%; --foreground: 215 25% 27%; --surface: 0 0% 100%;
                --card: 0 0% 100%; --card-foreground: 215 25% 27%; --card-border: 220 13% 91%;
                --primary: 217 91% 60%; --primary-foreground: 0 0% 100%; --primary-muted: 217 91% 95%;
                --text-primary: 215 25% 27%; --text-secondary: 215 16% 47%; --text-muted: 215 13% 65%;
                --accent: 217 91% 60%; --accent-foreground: 0 0% 100%; --accent-hover: 217 91% 55%;
                --border: 220 13% 91%; --input: 220 13% 91%; --ring: 217 91% 60%;
                --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                --radius: 0.75rem;
            }
        }
        body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
        .surface { background-color: hsl(var(--surface)); }
        .text-primary { color: hsl(var(--text-primary)); }
        .text-secondary { color: hsl(var(--text-secondary)); }
        .text-muted { color: hsl(var(--text-muted)); }
        .bg-primary-muted { background-color: hsl(var(--primary-muted)); }
        .border-border { border-color: hsl(var(--border)); }
        .shadow-card { box-shadow: var(--shadow-card); }
        .hover-lift { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .heading-xl { font-size: 3.75rem; line-height: 1; font-weight: 800; letter-spacing: -0.025em; }
        .heading-lg { font-size: 3rem; line-height: 1; font-weight: 700; letter-spacing: -0.025em; }
        .heading-md { font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; }
        .body-lg { font-size: 1.125rem; line-height: 1.75rem; color: hsl(var(--text-secondary)); }
        .body-base { font-size: 1rem; line-height: 1.5rem; color: hsl(var(--text-secondary)); }
    </style>
</head>
<body class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 surface border-b border-border backdrop-blur-sm bg-surface/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="font-semibold text-xl text-primary">${data.fullName}</div>
                <nav class="hidden md:flex space-x-8">
                    <a href="#about" class="text-secondary hover:text-primary transition-colors duration-200">About</a>
                    <a href="#projects" class="text-secondary hover:text-primary transition-colors duration-200">Projects</a>
                    <a href="#contact" class="text-secondary hover:text-primary transition-colors duration-200">Contact</a>
                </nav>
            </div>
        </div>
    </header>

    <section id="about" class="py-20 lg:py-32">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="heading-xl mb-6">${data.fullName}</h1>
            <p class="text-2xl md:text-3xl text-primary font-medium mb-8">${data.professionalTitle}</p>
            <div class="max-w-2xl mx-auto">
                <p class="body-lg mb-8">${data.aboutMe}</p>
            </div>
        </div>
    </section>

    <section id="projects" class="py-20 bg-muted/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="heading-lg mb-4">Featured Projects</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${projectsHTML}
            </div>
        </div>
    </section>

    <footer id="contact" class="py-16 surface border-t border-border">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="heading-lg mb-4">Let's Work Together</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div class="text-center md:text-left">
                    <h3 class="font-semibold text-lg mb-2 text-primary">Email</h3>
                    <a href="mailto:${data.email}" class="text-secondary hover:text-primary transition-colors duration-200">${data.email}</a>
                </div>
                <div class="text-center md:text-right">
                    <h3 class="font-semibold text-lg mb-2 text-primary">Phone</h3>
                    <a href="tel:${data.phone}" class="text-secondary hover:text-primary transition-colors duration-200">${data.phone}</a>
                </div>
            </div>
            <div class="text-center pt-8 border-t border-border">
                <p class="text-muted">© ${new Date().getFullYear()} ${data.fullName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
};