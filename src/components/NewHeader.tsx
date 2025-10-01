import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

interface NewHeaderProps {
  onRegisterClick: () => void;
}

export const NewHeader = ({ onRegisterClick }: NewHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Benefits", href: "#benefits" },
    { label: "Eligibility", href: "#eligibility" },
    { label: "Registration", href: "#registration-section" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="P.P. SAVANI Centre for Excellence" className="h-12 md:h-14 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-foreground font-medium hover:text-primary"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              onClick={onRegisterClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground font-medium px-4 py-2 hover:bg-muted rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 px-4 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onRegisterClick();
                  }} 
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
