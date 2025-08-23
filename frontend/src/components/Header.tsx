     // src/components/Header.tsx

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  // Check if an access token exists in localStorage to determine login state
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/"); // Redirect to homepage after logout
    // Optionally, you could add a toast notification here
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          ResumeAI
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/resume">
            <Button variant="ghost">Resume</Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="ghost">Portfolio</Button>
          </Link>
          
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;