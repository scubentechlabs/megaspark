import logo from "@/assets/logo.png";

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="Mega Spark National Champion Logo" 
            className="h-24 md:h-32 w-auto object-contain"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Website Under Maintenance
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            The Mega Spark National Champion website is temporarily down due to heavy traffic. 
            Please check again in two hours.
          </p>
        </div>
        
        <div className="pt-8 text-sm text-muted-foreground">
          <p>We apologize for any inconvenience.</p>
          <p className="mt-2">Thank you for your patience.</p>
        </div>
      </div>
    </div>
  );
};
