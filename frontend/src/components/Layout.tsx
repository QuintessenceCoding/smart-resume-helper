import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, User, Home, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button"; // Import the Button component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if an access token exists to determine login state
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/"); // Redirect to homepage
    // We can add a toast notification here if you like
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">ResumeAI</span>
            </Link>
            
            {/* Right side of Navbar */}
            <div className="flex items-center space-x-4">
              {/* Main Navigation Links */}
              <div className="hidden sm:flex items-center space-x-2">
                  <Link 
                    to="/" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                      isActive('/') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                  <Link 
                    to="/resume" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                      isActive('/resume') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Resume</span>
                  </Link>
                  <Link 
                    to="/portfolio" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                      isActive('/portfolio') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Portfolio</span>
                  </Link>
              </div>

              {/* Authentication Buttons */}
              <div className="flex items-center space-x-2">
                {isLoggedIn ? (
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;