import megaSparkPoster from "@/assets/results-poster.png";

export const ResultsPoster = () => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="w-full max-w-5xl mx-auto">
          <img 
            src={megaSparkPoster}
            alt="PP Savani CFE - JEE 2025 and NEET 2025 Results - Top Rankers"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};
