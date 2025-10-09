import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

export const NewFooter = () => {
  return (
    <footer id="contact" className="bg-card pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <img src={logo} alt="P.P. SAVANI Centre for Excellence" className="h-12 md:h-14 w-auto mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Centre for Excellence - IIT-JEE | NEET | CA-CS Foundation. Empowering students through accessible education.
            </p>
          </div>


          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <a href="mailto:digital.cfe.ppsavani@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">
                  digital.cfe.ppsavani@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">
                  <a href="tel:+919978651005" className="hover:text-accent transition-colors block">9978651005</a>
                  <a href="tel:+919978651004" className="hover:text-accent transition-colors block">9978651004</a>
                  <a href="tel:+919978651003" className="hover:text-accent transition-colors block">9978651003</a>
                  <a href="tel:+919978651002" className="hover:text-accent transition-colors block">9978651002</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  P.P. Savani School Campus,
                  <br />
                  Surat, Gujarat, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 P.P. SAVANI Centre for Excellence. All rights reserved. | Crafted With ❤️ by Stabulam
          </p>
        </div>
      </div>
    </footer>
  );
};
