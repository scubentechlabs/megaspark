import { Card, CardContent } from "@/components/ui/card";
import { Phone, AlertCircle } from "lucide-react";

export const HelpBox = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">Need Help?</h3>
                
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                  <p className="text-sm text-foreground font-medium">
                    <AlertCircle className="inline h-4 w-4 mr-2 text-yellow-600" />
                    If website not working, please try after 10–15 minutes.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Contact Support:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <a 
                        href="tel:+919978651005" 
                        className="text-sm text-accent hover:text-primary font-medium transition-colors"
                      >
                        9978651005
                      </a>
                      <a 
                        href="tel:+919978651004" 
                        className="text-sm text-accent hover:text-primary font-medium transition-colors"
                      >
                        9978651004
                      </a>
                      <a 
                        href="tel:+919978651003" 
                        className="text-sm text-accent hover:text-primary font-medium transition-colors"
                      >
                        9978651003
                      </a>
                      <a 
                        href="tel:+919978651002" 
                        className="text-sm text-accent hover:text-primary font-medium transition-colors"
                      >
                        9978651002
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
