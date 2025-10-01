import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "../RegistrationForm";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface EssayStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const EssayStep = ({ formData, updateFormData }: EssayStepProps) => {
  const wordCount = formData.essay.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = formData.essay.length;
  const minWords = 150;
  const maxWords = 1000;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Personal Statement</h3>
        <p className="text-muted-foreground">
          Share your story, aspirations, and why you deserve this scholarship. 
          Be authentic and let your passion shine through.
        </p>
      </div>

      <Card className="p-4 bg-accent/10 border-accent/20">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Essay Prompts (choose one or address multiple):</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>What are your academic and career goals?</li>
              <li>Describe a challenge you've overcome and what you learned</li>
              <li>How will this scholarship help you achieve your dreams?</li>
              <li>What makes you a strong candidate for this program?</li>
              <li>How do you plan to give back to your community?</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="essay">Your Personal Statement *</Label>
        <Textarea
          id="essay"
          value={formData.essay}
          onChange={(e) => updateFormData({ essay: e.target.value })}
          placeholder="Begin writing your story here..."
          className="min-h-[400px] resize-none font-serif text-base leading-relaxed"
        />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {wordCount} words ({charCount} characters)
          </span>
          <span className={wordCount < minWords ? "text-destructive" : wordCount > maxWords ? "text-destructive" : "text-success"}>
            Target: {minWords}-{maxWords} words
          </span>
        </div>
      </div>

      {wordCount < minWords && (
        <p className="text-sm text-destructive">
          Please write at least {minWords - wordCount} more words to meet the minimum requirement.
        </p>
      )}
      
      {wordCount > maxWords && (
        <p className="text-sm text-destructive">
          Your essay exceeds the maximum word count by {wordCount - maxWords} words.
        </p>
      )}
    </div>
  );
};
