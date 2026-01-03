import { Card } from "@/components/ui/card";
import { NewRegistrationForm } from "./NewRegistrationForm";

interface MultiStepRegistrationProps {
  onClose: () => void;
}

export const MultiStepRegistration = ({ onClose }: MultiStepRegistrationProps) => {
  return (
    <Card className="w-full border-0 shadow-none rounded-lg">
      <NewRegistrationForm onClose={onClose} />
    </Card>
  );
};
