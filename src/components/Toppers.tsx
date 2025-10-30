import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
import navneetAnghan2 from "@/assets/toppers/navneet-anghan-2.jpg";
import shikhaPatel from "@/assets/toppers/shikha-patel.jpg";
import subhashMalviya from "@/assets/toppers/subhash-malviya.jpg";
import harshVavadiya2 from "@/assets/toppers/harsh-vavadiya-2.jpg";
import jadhavVarad from "@/assets/toppers/jadhav-varad.jpg";
import monilChandgadhiya2 from "@/assets/toppers/monil-chandgadhiya-2.jpg";
import jeeMains2025 from "@/assets/toppers/jee-mains-2025.jpg";
import chiefMinisterVisit from "@/assets/toppers/chief-minister-visit.jpg";
import aimFocus from "@/assets/toppers/aim-focus.jpg";
import neet2025Rank from "@/assets/toppers/neet-2025-rank.jpg";
import sandipThakkar from "@/assets/toppers/sandip-thakkar.webp";
import shikhaPatel2 from "@/assets/toppers/shikha-patel-2.webp";
import subhashMalviya2 from "@/assets/toppers/subhash-malviya-2.webp";
import jadhavVarad2 from "@/assets/toppers/jadhav-varad-2.webp";
import yugKhokhariya2 from "@/assets/toppers/yug-khokhariya-2.webp";

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
  { image: navneetAnghan2, alt: "Navneet Anghan - 1st Ranker, NEET 695/720" },
  { image: shikhaPatel, alt: "Shikha Patel - NEET 685/720, BJ Medical" },
  { image: subhashMalviya, alt: "Subhash Malviya - AIR 3, IIT Delhi" },
  { image: harshVavadiya2, alt: "Harsh Vavadiya - AIR 26, IIT Ropar" },
  { image: jadhavVarad, alt: "Jadhav Varad - AIR 2, AIIMS Delhi" },
  { image: monilChandgadhiya2, alt: "Monil Chandgadhiya - AIR 11, IIT Dhanbad" },
  { image: jeeMains2025, alt: "JEE Mains 2025 Results" },
  { image: chiefMinisterVisit, alt: "Chief Minister Visit - Congratulations" },
  { image: aimFocus, alt: "Gujarat #1 & AIR 6 Achievement" },
  { image: neet2025Rank, alt: "NEET 2025 - First Rank Achievement" },
  { image: sandipThakkar, alt: "Sandip Thakkar - BJ Medical, NEET 701/720" },
  { image: shikhaPatel2, alt: "Shikha Patel - BJ Medical, NEET 685/720" },
  { image: subhashMalviya2, alt: "Subhash Malviya - AIR 3, IIT Delhi" },
  { image: jadhavVarad2, alt: "Jadhav Varad - AIR 2, AIIMS Delhi, NEET 700/720" },
  { image: yugKhokhariya2, alt: "Yug Khokhariya - AIR 8, AIIMS Delhi, GUJCET 120/120" },
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
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
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
