import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export const NewFooter = () => {
  return (
    <footer id="contact" className="bg-card pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Schdent</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Empowering students through accessible education and scholarship opportunities.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent flex items-center justify-center text-accent hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent flex items-center justify-center text-accent hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent flex items-center justify-center text-accent hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent flex items-center justify-center text-accent hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="#participants" className="text-muted-foreground hover:text-primary transition-colors">Participants</a></li>
              <li><a href="#category" className="text-muted-foreground hover:text-primary transition-colors">Category</a></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Scholarship Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Application Tips</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@schdent.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@schdent.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Education Street,
                  <br />
                  Knowledge City, ED 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Schdent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
