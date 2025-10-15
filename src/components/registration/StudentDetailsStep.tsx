import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const stateDistrictsData: Record<string, string[]> = {
  "Andhra Pradesh": ["Adoni", "Anantapur", "Bhimavaram", "Chittoor", "Dharmavaram", "Eluru", "Gudivada", "Guntakal", "Guntur", "Hindupur", "Kadapa", "Kakinada", "Kurnool", "Machilipatnam", "Madanapalle", "Nandyal", "Nellore", "Ongole", "Proddatur", "Rajahmundry", "Tenali", "Tirupati", "Visakhapatnam", "Vijayawada", "Vizianagaram"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahesana", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Karnataka": ["Bagalkot", "Bangalore", "Belgaum", "Bellary", "Bhadravati", "Bidar", "Bijapur", "Chikmagalur", "Chitradurga", "Davanagere", "Gadag", "Gangavati", "Gulbarga", "Hassan", "Hospet", "Hubli", "Kolar", "Mandya", "Mangalore", "Mysore", "Raichur", "Ranebennuru", "Robertsonpet", "Shimoga", "Tumkur", "Udupi"],
  "Madhya Pradesh": ["Balaghat", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Dewas", "Guna", "Gwalior", "Hoshangabad", "Indore", "Jabalpur", "Khandwa", "Khargone", "Mandsaur", "Morena", "Murwara", "Neemuch", "Pithampur", "Ratlam", "Rewa", "Sagar", "Satna", "Seoni", "Shivpuri", "Singrauli", "Ujjain", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhiwandi", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Chikmagalur", "Coimbatore", "Cuddalore", "Dindigul", "Erode", "Kancheepuram", "Madurai", "Nagapattinam", "Nagercoil", "Neyveli", "Pollachi", "Pudukkottai", "Rajapalayam", "Ranipet", "Salem", "Sivakasi", "Thanjavur", "Theni", "Tiruchengode", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvannamalai", "Valparai", "Vaniyambadi", "Vellore", "Viluppuram"],
  "Telangana": ["Adilabad", "Bellampalle", "Bhongir", "Bodhan", "Hyderabad", "Jagtial", "Karimnagar", "Khammam", "Koratla", "Kothagudem", "Mahabubnagar", "Mancherial", "Mandamarri", "Miryalaguda", "Nalgonda", "Nirmal", "Nizamabad", "Palwancha", "Ramagundam", "Sadasivpet", "Siddipet", "Sircilla", "Suryapet", "Tandur", "Warangal"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Amroha", "Ayodhya", "Bareilly", "Bulandshahr", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Ghaziabad", "Gorakhpur", "Hapur", "Hardoi", "Jhansi", "Kanpur", "Lucknow", "Mathura", "Maunath Bhanjan", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Noida", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Shahjahanpur", "Varanasi"],
  "West Bengal": ["Alipurduar", "Asansol", "Baharampur", "Balurghat", "Bankura", "Bardhaman", "Basirhat", "Chakdaha", "Dankuni", "Darjeeling", "Dhulian", "Durgapur", "Habra", "Haldia", "Jalpaiguri", "Jangipur", "Kharagpur", "Kolkata", "Krishnanagar", "Malda", "Medinipur", "Nabadwip", "Purulia", "Raiganj", "Ranaghat", "Shantipur", "Siliguri"]
};

export const StudentDetailsStep = ({ formData, updateFormData }: StudentDetailsStepProps) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    // Keep only digits and cap at 10
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateFormData({ [field]: value });
  };

  const handleStateChange = (value: string) => {
    updateFormData({ state: value, district: "" });
  };

  const availableDistricts = formData.state ? stateDistrictsData[formData.state] || [] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student's Full Name *</Label>
          <Input
            id="studentName"
            value={formData.studentName || ""}
            onChange={(e) => updateFormData({ studentName: e.target.value })}
            placeholder="Enter student's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentName">Parent's Full Name *</Label>
          <Input
            id="parentName"
            value={formData.parentName || ""}
            onChange={(e) => updateFormData({ parentName: e.target.value })}
            placeholder="Enter parent's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Enter Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="text"
            value={formData.phoneNumber || ""}
            onChange={(e) => handlePhoneChange(e, 'phoneNumber')}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            required
          />
          {formData.phoneNumber && formData.phoneNumber.length !== 10 && (
            <p className="text-xs text-destructive">Mobile number must be 10 digits</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">Your WhatsApp Number *</Label>
          <Input
            id="whatsappNumber"
            type="text"
            value={formData.whatsappNumber || ""}
            onChange={(e) => handlePhoneChange(e, 'whatsappNumber')}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            required
          />
          {formData.whatsappNumber && formData.whatsappNumber.length !== 10 && (
            <p className="text-xs text-destructive">WhatsApp number must be 10 digits</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select
            value={formData.state || ""}
            onValueChange={handleStateChange}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(stateDistrictsData).sort().map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Select
            value={formData.district || ""}
            onValueChange={(value) => updateFormData({ district: value })}
            disabled={!formData.state}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder={formData.state ? "Select district" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
