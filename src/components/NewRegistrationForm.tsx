import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const olympiadOptions = [
  "None",
  "SOF (Science Olympiad Foundation)",
  "IMO (International Mathematics Olympiad)",
  "NSO (National Science Olympiad)",
  "IEO (International English Olympiad)",
  "NCO (National Cyber Olympiad)",
  "NTSE (National Talent Search Exam)",
  "KVPY (Kishore Vaigyanik Protsahan Yojana)",
  "Other"
];

const gujaratDistricts = [
  "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
  "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar",
  "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana",
  "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
  "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
];

interface NewRegistrationFormProps {
  onClose?: () => void;
}

export const NewRegistrationForm = ({ onClose }: NewRegistrationFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileError, setMobileError] = useState<string>("");
  const [olympiadCertFile, setOlympiadCertFile] = useState<File | null>(null);
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingMarksheet, setUploadingMarksheet] = useState(false);

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
    if (updates.phoneNumber !== undefined) {
      setMobileError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateFormData({ [field]: value });
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0 && !value.startsWith('91')) {
      value = '91' + value;
    }
    value = value.slice(0, 12);
    updateFormData({ whatsappNumber: value });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    const numValue = parseFloat(value);
    if (numValue > 100) {
      value = '100';
    }
    updateFormData({ previousYearPercentage: value });
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    updateFormData({ classRank: value });
  };

  const uploadFile = async (file: File, type: 'certificate' | 'marksheet'): Promise<string | null> => {
    const timestamp = Date.now();
    const fileName = `${type}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('registration-documents')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('registration-documents')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'certificate' | 'marksheet') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    if (type === 'certificate') {
      setOlympiadCertFile(file);
    } else {
      setMarksheetFile(file);
    }
  };

  const removeFile = (type: 'certificate' | 'marksheet') => {
    if (type === 'certificate') {
      setOlympiadCertFile(null);
      updateFormData({ olympiadCertificateUrl: null });
    } else {
      setMarksheetFile(null);
      updateFormData({ marksheetUrl: null });
    }
  };

  const validateForm = () => {
    if (!formData.studentName?.trim()) {
      toast.error("Please enter student's full name");
      return false;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.confirmPhoneNumber) {
      toast.error("Please confirm your mobile number");
      return false;
    }
    if (!formData.whatsappNumber || formData.whatsappNumber.length !== 12 || !formData.whatsappNumber.startsWith('91')) {
      toast.error("WhatsApp number must be 12 digits (91 + 10-digit number)");
      return false;
    }
    if (!formData.standard) {
      toast.error("Please select class");
      return false;
    }
    if (!formData.schoolName?.trim()) {
      toast.error("Please enter school name");
      return false;
    }
    if (!formData.city?.trim()) {
      toast.error("Please enter city");
      return false;
    }
    if (!formData.district) {
      toast.error("Please select district");
      return false;
    }
    if (!formData.previousYearPercentage?.trim()) {
      toast.error("Please enter previous class percentage");
      return false;
    }
    if (!formData.classRank?.trim()) {
      toast.error("Please enter class rank");
      return false;
    }
    if (!formData.olympiadAppeared) {
      toast.error("Please select olympiad participation status");
      return false;
    }
    if (!marksheetFile) {
      toast.error("Please upload last class marksheet");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Check for duplicate mobile number
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('registrations')
        .select('id, mobile_number')
        .eq('mobile_number', formData.phoneNumber)
        .limit(1);

      if (checkError) throw checkError;

      if (existingRegistrations && existingRegistrations.length > 0) {
        setMobileError("This mobile number is already registered.");
        setIsSubmitting(false);
        return;
      }

      // Upload files
      let olympiadCertUrl = null;
      let marksheetUrl = null;

      if (olympiadCertFile) {
        setUploadingCert(true);
        olympiadCertUrl = await uploadFile(olympiadCertFile, 'certificate');
        setUploadingCert(false);
      }

      if (marksheetFile) {
        setUploadingMarksheet(true);
        marksheetUrl = await uploadFile(marksheetFile, 'marksheet');
        setUploadingMarksheet(false);
        if (!marksheetUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Insert registration
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          student_name: formData.studentName,
          mobile_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber,
          standard: formData.standard,
          school_name: formData.schoolName,
          city: formData.city,
          district: formData.district,
          previous_year_percentage: formData.previousYearPercentage,
          class_rank: formData.classRank,
          olympiad_appeared: formData.olympiadAppeared,
          olympiad_certificate_url: olympiadCertUrl,
          marksheet_url: marksheetUrl,
          exam_center: 'PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150',
          state: 'Gujarat',
          registration_number: ''
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Registration Successful!", {
        description: "Redirecting to confirmation page..."
      });
      
      navigate("/registration-success");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", {
        description: error.message || "Please contact support."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none rounded-lg">
      <CardHeader className="pb-6 border-b">
        <CardTitle className="text-2xl md:text-3xl font-bold text-center text-primary">
          Mega Spark Exam Registration
        </CardTitle>
        <CardDescription className="text-center text-base">
          Fill in your details to register for the exam
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 md:px-6 pb-6 pt-6">
        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="studentName">Full Name *</Label>
            <Input
              id="studentName"
              value={formData.studentName || ""}
              onChange={(e) => updateFormData({ studentName: e.target.value })}
              placeholder="Enter student's full name"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Mobile Number *</Label>
              <Input
                id="phoneNumber"
                type="text"
                value={formData.phoneNumber || ""}
                onChange={(e) => handlePhoneChange(e, 'phoneNumber')}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
                className={mobileError ? "border-red-500" : ""}
              />
              {mobileError && <p className="text-sm text-red-600">{mobileError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
              <Input
                id="whatsappNumber"
                type="text"
                value={formData.whatsappNumber || ""}
                onChange={handleWhatsAppChange}
                placeholder="91XXXXXXXXXX"
                maxLength={12}
                required
              />
            </div>
          </div>

          {/* Phone Confirmation */}
          {formData.phoneNumber?.length === 10 && (
            <div className="flex items-start space-x-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Checkbox
                id="confirmPhone"
                checked={formData.confirmPhoneNumber || false}
                onCheckedChange={(checked) => updateFormData({ confirmPhoneNumber: checked })}
                className="mt-1"
              />
              <Label htmlFor="confirmPhone" className="text-sm cursor-pointer">
                I confirm that <strong>{formData.phoneNumber}</strong> is correct
              </Label>
            </div>
          )}

          {/* Class */}
          <div className="space-y-2">
            <Label htmlFor="standard">Class *</Label>
            <Select value={formData.standard || ""} onValueChange={(value) => updateFormData({ standard: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Class 5</SelectItem>
                <SelectItem value="6">Class 6</SelectItem>
                <SelectItem value="7">Class 7</SelectItem>
                <SelectItem value="8">Class 8</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* School Name */}
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name *</Label>
            <Input
              id="schoolName"
              value={formData.schoolName || ""}
              onChange={(e) => updateFormData({ schoolName: e.target.value })}
              placeholder="Enter school name"
              required
            />
          </div>

          {/* City and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="Enter city name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select value={formData.district || ""} onValueChange={(value) => updateFormData({ district: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {gujaratDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Previous Year Percentage and Class Rank */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previousYearPercentage">Previous Class Percentage (%) *</Label>
              <Input
                id="previousYearPercentage"
                type="text"
                value={formData.previousYearPercentage || ""}
                onChange={handlePercentageChange}
                placeholder="e.g., 85 or 85.5"
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classRank">Class Rank *</Label>
              <Input
                id="classRank"
                type="text"
                value={formData.classRank || ""}
                onChange={handleRankChange}
                placeholder="Enter class rank"
                required
              />
            </div>
          </div>

          {/* Olympiad Participation */}
          <div className="space-y-2">
            <Label htmlFor="olympiadAppeared">Have you appeared for any Olympiad? *</Label>
            <Select 
              value={formData.olympiadAppeared || ""} 
              onValueChange={(value) => updateFormData({ olympiadAppeared: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {olympiadOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Olympiad Certificate Upload - only show if olympiad selected is not "None" */}
          {formData.olympiadAppeared && formData.olympiadAppeared !== "None" && (
            <div className="space-y-2">
              <Label>Upload Olympiad Certificate (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {olympiadCertFile ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                    <span className="text-sm truncate flex-1">{olympiadCertFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('certificate')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload certificate</span>
                    <span className="text-xs text-muted-foreground">(JPG, PNG, PDF - Max 5MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Marksheet Upload */}
          <div className="space-y-2">
            <Label>Upload Last Class Marksheet *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              {marksheetFile ? (
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                  <span className="text-sm truncate flex-1">{marksheetFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('marksheet')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload marksheet</span>
                  <span className="text-xs text-muted-foreground">(JPG, PNG, PDF - Max 5MB)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'marksheet')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadingCert || uploadingMarksheet}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
          >
            {isSubmitting || uploadingCert || uploadingMarksheet ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {uploadingCert ? "Uploading Certificate..." : uploadingMarksheet ? "Uploading Marksheet..." : "Processing..."}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Submit Registration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
