import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Award, HeadphonesIcon } from "lucide-react";
import { useState } from "react";

const benefits = [
  {
    icon: Trophy,
    title: "₹75 Crore Scholarship Fund",
    description: "Access to India's largest scholarship pool for aspiring students",
    detail: "Win from a massive scholarship fund worth ₹75 Crores distributed among deserving candidates based on merit and performance.",
    color: "bg-gradient-to-br from-primary to-primary/80"
  },
  {
    icon: Users,
    title: "1000 Students - 100% Scholarship",
    description: "Complete fee waiver through Dattak Yojana",
    detail: "1000 exceptional students will receive 100% scholarship coverage under our exclusive Dattak Yojana program for their entire academic journey.",
    color: "bg-gradient-to-br from-primary to-primary/80"
  },
  {
    icon: Award,
    title: "Educational NASA & Japan Trip for Free",
    description: "Global exposure for top performers",
    detail: "Top students earn global exposure through Mega Spark National Champion scholarships.",
    color: "bg-gradient-to-br from-primary to-primary/80"
  },
  {
    icon: HeadphonesIcon,
    title: "Free Career Counselling",
    description: "Expert guidance for your future path",
    detail: "Get personalized career counselling sessions from industry experts to help you make informed decisions about your academic and professional future.",
    color: "bg-gradient-to-br from-primary to-primary/80"
  }
];

export const BenefitsSection = () => {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const toggleFlip = (idx: number) => {
    setFlippedCards(prev => 
      prev.includes(idx) 
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  return (
    <section id="benefits" className="py-12 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            Why Choose Mega Spark National Champion
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            const isFlipped = flippedCards.includes(idx);
            
            return (
              <div
                key={idx}
                className="perspective-1000 h-[280px]"
                onClick={() => toggleFlip(idx)}
                onMouseEnter={() => !flippedCards.includes(idx) && toggleFlip(idx)}
                onMouseLeave={() => flippedCards.includes(idx) && toggleFlip(idx)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front of card */}
                  <Card
                    className={`absolute inset-0 backface-hidden hover:shadow-hover transition-all duration-300 border-2 border-transparent hover:border-primary/20 overflow-hidden ${
                      isFlipped ? 'pointer-events-none' : ''
                    }`}
                  >
                    <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center relative">
                      <div className={`mb-4 h-20 w-20 rounded-2xl ${benefit.color} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground leading-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Back of card */}
                  <Card
                    className={`absolute inset-0 backface-hidden rotate-y-180 border-2 ${
                      !isFlipped ? 'pointer-events-none' : ''
                    }`}
                    style={{ borderColor: 'hsl(var(--primary))' }}
                  >
                    <CardContent className={`p-6 h-full flex flex-col justify-center text-center ${benefit.color} text-white`}>
                      <Icon className="h-12 w-12 mx-auto mb-4 opacity-90" />
                      <h3 className="text-lg font-bold mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-sm leading-relaxed opacity-95">
                        {benefit.detail}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};
