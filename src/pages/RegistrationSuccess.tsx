import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartyPopper, Download, Share2, Home, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9b87f5', '#0EA5E9', '#F97316']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9b87f5', '#0EA5E9', '#F97316']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handleDownloadHallTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    toast.success("Hall ticket downloaded successfully!");
    // Simulate PDF download
    setTimeout(() => {
      toast.info("Check your downloads folder");
    }, 1000);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      "🎉 I just registered for Mega Spark Exam 2025! Join me and compete for scholarships worth ₹2 Crores. Register now at: https://megaspark2025.com"
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl animate-scale-in">
        <CardContent className="p-8 md:p-12">
          {/* Success Icon with Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-pulse">
              <PartyPopper className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Congratulations! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-foreground font-semibold mb-2">
              You're officially registered for
            </p>
            <p className="text-2xl md:text-3xl font-bold text-accent">
              Mega Spark Exam 2025!
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="P.P. SAVANI CFE" className="h-20 w-auto" />
          </div>

          {/* Hall Ticket Download Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Download Hall Ticket</h3>
              </div>
              <form onSubmit={handleDownloadHallTicket} className="space-y-4">
                <div>
                  <Label htmlFor="mobile" className="text-sm font-semibold">
                    Enter Mobile Number
                  </Label>
                  <div className="flex gap-3 mt-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-10 h-12 text-lg"
                        maxLength={10}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 h-12 font-semibold"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Generate PDF
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* WhatsApp Share Section */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/20 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Share with Friends</h3>
                    <p className="text-sm text-muted-foreground">Help your friends win scholarships too!</p>
                  </div>
                </div>
                <Button
                  onClick={handleWhatsAppShare}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white px-6 py-6 text-lg font-semibold whitespace-nowrap"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-accent mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse mt-2" />
                <div className="flex-1">
                  <strong className="text-primary text-lg">Important Reminder:</strong>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Report to exam center by <strong className="text-accent">8:00 AM</strong> on exam day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Bring valid ID proof and your hall ticket</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Check your email for confirmation and study materials</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-2 border-primary hover:bg-primary/10 py-6 text-lg font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-6 text-lg font-semibold"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Study Material
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
