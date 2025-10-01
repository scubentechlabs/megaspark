import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Building } from "lucide-react";
import studentHero from "@/assets/student-hero.png";

interface NewHeroProps {
  onRegisterClick: () => void;
}

export const NewHero = ({ onRegisterClick }: NewHeroProps) => {
  return (
    <section id="home" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Free{" "}
                <span className="text-primary">Scholarships</span>
                <br />
                For Every Bright
                <br />
                Student
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Get free scholarships for every level of education that every student who achieves 
                a bright future can get
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                size="lg"
                onClick={onRegisterClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold"
              >
                Submission
              </Button>
              <button className="text-foreground font-medium hover:text-primary transition-colors">
                How to apply submission?
              </button>
            </div>
          </div>

          {/* Right Content - Student Image with Blob */}
          <div className="relative">
            {/* Purple Blob Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-blob rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-80 blur-sm" />
            
            {/* Student Image */}
            <div className="relative z-10 flex justify-center">
              <img
                src={studentHero}
                alt="Student holding folder"
                className="w-full max-w-md object-contain"
              />
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-bounce">
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
            
            <div className="absolute bottom-20 left-0 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats Card - Top Right */}
        <Card className="absolute top-8 right-8 p-6 shadow-hover hidden xl:block max-w-xs">
          <div className="mb-4">
            <span className="text-primary text-sm font-semibold uppercase tracking-wide">Platform</span>
            <h3 className="text-xl font-bold mt-1">
              An <span className="text-primary">Educational</span> Service
              <br />
              With Rapid Development
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-foreground">1050+</div>
              <div className="text-sm text-muted-foreground">Scholarship</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">3500+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Partner Group</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            With more highly educated people, the hope is that they can become valuable assets for 
            the country's future development
          </p>
        </Card>
      </div>
    </section>
  );
};
