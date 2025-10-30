import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import dhruvPansuriya from "@/assets/toppers/dhruv-pansuriya.webp";
import harshVavadiya from "@/assets/toppers/harsh-vavadiya.webp";
import monilChandgadhiya from "@/assets/toppers/monil-chandgadhiya.webp";
import navneetAnghan from "@/assets/toppers/navneet-anghan.webp";
import neelLathiya from "@/assets/toppers/neel-lathiya.webp";
import dhruvanshuNakrani from "@/assets/toppers/dhruvanshu-nakrani.webp";
import malayShah from "@/assets/toppers/malay-shah.webp";
import vanshDhanani from "@/assets/toppers/vansh-dhanani.webp";
import yugKhokhariya from "@/assets/toppers/yug-khokhariya.jpg";
import dhruvPansuriyaGujarati from "@/assets/toppers/dhruv-pansuriya-gujarati.jpg";

const toppersData = [
  { image: dhruvPansuriya, alt: "Dhruv Pansuriya - AIR 50, IIT Guwahati" },
  { image: harshVavadiya, alt: "Harsh Vavadiya - AIR 26, IIT Ropar" },
  { image: monilChandgadhiya, alt: "Monil Chandgadhiya - AIR 11, IIT Dhanbad" },
  { image: navneetAnghan, alt: "Navneet Anghan - Vardhman Delhi, NEET 695/720" },
  { image: neelLathiya, alt: "Neel Lathiya - AIR 30, AIIMS Delhi" },
  { image: dhruvanshuNakrani, alt: "Dhruvanshu Nakrani - 1st with 95% CBSE Board" },
  { image: malayShah, alt: "Malay Shah - 100/100 Accountancy" },
  { image: vanshDhanani, alt: "Vansh Dhanani - Rank 3, CBSE Board Commerce" },
  { image: yugKhokhariya, alt: "Yug Khokhariya - AIR 8, AIIMS Delhi" },
  { image: dhruvPansuriyaGujarati, alt: "Dhruv Pansuriya - AIR 50, IIT Guwahati" },
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
                  <CardContent className="p-0">
                    <div className="w-full aspect-square">
                      <img 
                        src={topper.image} 
                        alt={topper.alt}
                        className="w-full h-full object-cover"
                      />
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
