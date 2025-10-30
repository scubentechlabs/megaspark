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
    name: "Sandip Thakkar",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 2",
    name: "Jadhav Varad",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 30",
    name: "Neel Lathiya",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  },
  {
    rank: "AIR 26",
    name: "Harsh Vavadiya",
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
                <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-card overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-48 h-48 overflow-hidden border-4 border-accent rounded-lg">
                          <img 
                            src={topper.image} 
                            alt={topper.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
