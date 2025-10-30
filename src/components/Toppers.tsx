import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const toppersData = [
  {
    rank: "AIR 1",
    exam: "AIIMS-DELHI",
    name: "Sandip Thakkar",
    score: "NEET 701/720",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 2",
    exam: "AIIMS-DELHI",
    name: "Jadhav Varad",
    score: "NEET 700/720",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 30",
    exam: "AIIMS-DELHI",
    name: "Neel Lathiya",
    score: "NEET 710/720",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 26",
    exam: "IIT-ROPAR",
    name: "Harsh Vavadiya",
    score: "JEE-ADV",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
];

export const Toppers = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-lg font-semibold text-primary mb-2">PP Savani CFE</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Toppers
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {toppersData.map((topper, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow bg-card overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <img 
                        src="https://storage.googleapis.com/gpt-engineer-file-uploads/TNjmXhhfoAdSBHUh7DzUYOimY482/uploads/1759299584851-PPS-CFE%20LOGO.png" 
                        alt="PP Savani CFE Logo" 
                        className="h-8"
                      />
                      <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                        #सफलता
                      </div>
                    </div>

                    {/* Toppers Badge */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-lg inline-block">
                      <span className="text-xl font-bold">#TOPPERS</span>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-3">
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-foreground">{topper.rank}</h3>
                        <p className="text-sm font-semibold text-primary">{topper.exam}</p>
                      </div>

                      {/* Student Image */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-accent overflow-hidden">
                            <img 
                              src={topper.image} 
                              alt={topper.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 text-xs font-bold">
                            ★
                          </div>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="text-right">
                        <h4 className="text-lg font-bold text-foreground">{topper.name}</h4>
                        <p className="text-accent text-sm font-semibold">({topper.score})</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-center text-muted-foreground font-semibold">
                        Best Residential School + Coaching
                      </p>
                      <div className="flex gap-2 justify-center mt-2">
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">9998.com/pps</span>
                        <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded">@ppscfe.official</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 -left-4 md:-left-12" />
          <CarouselNext className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 -right-4 md:-right-12" />
        </Carousel>
      </div>
    </section>
  );
};
