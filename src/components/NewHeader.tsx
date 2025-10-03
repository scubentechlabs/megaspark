import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

interface NewHeaderProps {
  onRegisterClick: () => void;
}

export const NewHeader = ({ onRegisterClick }: NewHeaderProps) => {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="P.P. SAVANI Centre for Excellence" className="h-12 md:h-14 w-auto" />
          </div>

          {/* Register Button */}
          <div className="flex items-center">
            <Button
              onClick={onRegisterClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8"
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
