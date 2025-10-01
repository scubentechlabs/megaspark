import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-scholarship.jpg";

interface HeroProps {
  onRegisterClick: () => void;
}

export const Hero = ({ onRegisterClick }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-6 py-2 text-white border border-white/20">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">2025 Scholarship Program</span>
          </div>
          
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white leading-tight">
            Transform Your Future
            <br />
            <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              With Education
            </span>
          </h1>
          
          <p className="mb-10 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Apply for the National Excellence Scholarship. Full tuition coverage, 
            mentorship programs, and career opportunities await exceptional students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onRegisterClick}
              className="bg-white text-primary hover:bg-white/90 shadow-xl font-semibold text-lg px-8 py-6 h-auto group"
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6 h-auto"
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { value: "$50,000", label: "Full Scholarship Value" },
              { value: "500+", label: "Scholarships Available" },
              { value: "95%", label: "Graduate Success Rate" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
