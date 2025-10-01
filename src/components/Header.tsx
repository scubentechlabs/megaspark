import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";

interface HeaderProps {
  onRegisterClick: () => void;
}

export const Header = ({ onRegisterClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Benefits", href: "#benefits" },
    { label: "Eligibility", href: "#eligibility" },
    { label: "Timeline", href: "#timeline" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg leading-tight ${isScrolled ? 'text-foreground' : 'text-white'}`}>
                National Scholarship
              </span>
              <span className={`text-xs ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>
                Excellence Program
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? 'text-foreground' : 'text-white hover:text-white/80'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Button
            onClick={onRegisterClick}
            className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply Now
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-white'}`}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground font-medium px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  onRegisterClick();
                  setIsMobileMenuOpen(false);
                }}
                className="mx-4 bg-primary hover:bg-primary/90"
              >
                Apply Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
