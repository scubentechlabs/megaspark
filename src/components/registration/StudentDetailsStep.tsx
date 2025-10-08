import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const stateDistrictsData: Record<string, string[]> = {
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Bharuch", "Mehsana", "Patan", "Sabarkantha", "Surendranagar", "Kutch", "Amreli", "Banaskantha", "Dahod", "Narmada", "Navsari", "Panchmahal", "Porbandar", "Tapi", "Valsad", "Gir Somnath", "Morbi", "Devbhumi Dwarka", "Mahisagar", "Aravalli", "Botad", "Chhota Udaipur", "Kheda", "Mahesana"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Dhule", "Amravati", "Kolhapur", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Ahmednagar", "Chandrapur", "Parbhani", "Jalna", "Bhiwandi", "Navi Mumbai", "Raigad", "Satara", "Yavatmal", "Ratnagiri", "Beed", "Buldhana", "Gondia", "Hingoli", "Wardha", "Washim", "Gadchiroli", "Osmanabad", "Palghar", "Sindhudurg"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Tonk", "Barmer", "Churu", "Ganganagar", "Hanumangarh", "Jhunjhunu", "Nagaur", "Sawai Madhopur", "Banswara", "Baran", "Bundi", "Chittorgarh", "Dausa", "Dholpur", "Dungarpur", "Jaisalmer", "Jalore", "Jhalawar", "Karauli", "Pratapgarh", "Rajsamand", "Sirohi"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Seoni", "Betul", "Balaghat"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Rampur", "Shahjahanpur", "Farrukhabad", "Ayodhya", "Maunath Bhanjan", "Hapur", "Etawah", "Mirzapur", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hospet", "Hassan", "Gadag", "Udupi", "Robertsonpet", "Bhadravati", "Chitradurga", "Kolar", "Mandya", "Chikmagalur", "Gangavati", "Bagalkot", "Ranebennuru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Ranipet", "Nagercoil", "Thanjavur", "Vellore", "Kancheepuram", "Erode", "Tiruvannamalai", "Pollachi", "Rajapalayam", "Sivakasi", "Pudukkottai", "Neyveli", "Nagapattinam", "Viluppuram", "Tiruchengode", "Vaniyambadi", "Theni", "Cuddalore", "Dindigul", "Valparai", "Tirupattur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kakinada", "Tirupati", "Anantapur", "Kadapa", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Chittoor", "Hindupur", "Proddatur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Nirmal", "Kothagudem", "Bodhan", "Palwancha", "Mandamarri", "Koratla", "Sircilla", "Tandur", "Sadasivpet", "Bellampalle", "Bhongir"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Chakdaha", "Darjeeling", "Alipurduar", "Purulia", "Jangipur"]
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
              {Object.keys(stateDistrictsData).map((state) => (
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
