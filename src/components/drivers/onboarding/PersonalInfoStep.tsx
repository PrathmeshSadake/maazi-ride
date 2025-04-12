import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const PersonalInfoStep = ({ formData, setFormData }: PersonalInfoStepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium'>Personal Information</h3>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='firstName'>First Name</Label>
          <Input
            id='firstName'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='lastName'>Last Name</Label>
          <Input
            id='lastName'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phoneNumber'>Phone Number</Label>
          <Input
            id='phoneNumber'
            name='phoneNumber'
            type='tel'
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
