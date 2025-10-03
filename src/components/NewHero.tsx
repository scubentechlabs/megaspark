import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Download, Sparkles } from "lucide-react";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import { useEffect, useState } from "react";

interface NewHeroProps {
  onRegisterClick: () => void;
}

export const NewHero = ({ onRegisterClick }: NewHeroProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const sliderImages = [
    event1,
    event2,
    event3,
    event4,
    event5
  ];

  // Image slider effect
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 3000);

    return () => clearInterval(sliderInterval);
  }, []);

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
          <div className="space-y-8 animate-fade-in order-2 lg:order-1">
            <div>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-accent via-primary to-accent text-white mb-6 shadow-2xl animate-pulse border-2 border-white/30">
                <Sparkles className="h-5 w-5 animate-spin" />
                <span className="text-base font-bold tracking-wide">Mega Spark Exam 2025</span>
                <Sparkles className="h-5 w-5 animate-spin" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Win Scholarships Worth{" "}
                <span className="text-foreground">₹75 Crore</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-4xl md:text-5xl">
                  Mega Spark Exam 2025
                </span>
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

          {/* Right Content - Image Slider */}
          <div className="relative order-1 lg:order-2">
            {/* Navy Blob Background with Sparkle Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-blob rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-70 blur-sm animate-pulse" />
            
            {/* Glowing Sparkle Effects */}
            <div className="absolute top-10 right-10 w-4 h-4 bg-accent rounded-full animate-ping" />
            <div className="absolute top-32 right-20 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-32 right-16 w-4 h-4 bg-accent rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            
            {/* Image Slider */}
            <div className="relative z-10 flex justify-center overflow-hidden rounded-3xl">
              <div className="relative w-full h-[400px] lg:h-[600px] lg:max-w-2xl aspect-square lg:aspect-auto">
                {sliderImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Scholarship opportunity ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
              
              {/* Slider Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-accent w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
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
