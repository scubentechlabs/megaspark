import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Download, Sparkles } from "lucide-react";
import studentHero from "@/assets/student-hero-final.png";
import { useEffect, useState } from "react";

interface NewHeroProps {
  onRegisterClick: () => void;
}

export const NewHero = ({ onRegisterClick }: NewHeroProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-12-07T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadGuide = () => {
    const guideSection = document.getElementById('about');
    if (guideSection) {
      guideSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-semibold text-accent">Mega Spark Exam 2025</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Win Scholarships Worth{" "}
                <span className="text-accent">₹75 Crore</span>
                <br />
                <span className="text-primary">Mega Spark Exam 2025</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                The exam that opens doors to learning, growth, and limitless possibilities.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-card">
              <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Exam Starts In:
              </p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-gradient-to-br from-primary to-accent text-white rounded-xl p-3 mb-2">
                      <div className="text-3xl font-bold">{String(item.value).padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                size="lg"
                onClick={onRegisterClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-hover"
              >
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownloadGuide}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-6 text-lg font-semibold"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Guide
              </Button>
            </div>
          </div>

          {/* Right Content - Student Image with Blob */}
          <div className="relative">
            {/* Navy Blob Background with Sparkle Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-blob rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-70 blur-sm animate-pulse" />
            
            {/* Glowing Sparkle Effects */}
            <div className="absolute top-10 right-10 w-4 h-4 bg-accent rounded-full animate-ping" />
            <div className="absolute top-32 right-20 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-32 right-16 w-4 h-4 bg-accent rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            
            {/* Student Image */}
            <div className="relative z-10 flex justify-center">
              <img
                src={studentHero}
                alt="Student celebrating success"
                className="w-full max-w-md object-contain"
              />
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-bounce">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            
            <div className="absolute bottom-20 left-0 w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
