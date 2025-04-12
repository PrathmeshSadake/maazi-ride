import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VehicleInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const VehicleInfoStep = ({ formData, setFormData }: VehicleInfoStepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium'>Vehicle Information</h3>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='vehicleMake'>Vehicle Make</Label>
          <Input
            id='vehicleMake'
            name='vehicleMake'
            value={formData.vehicleMake}
            onChange={handleChange}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='vehicleModel'>Vehicle Model</Label>
          <Input
            id='vehicleModel'
            name='vehicleModel'
            value={formData.vehicleModel}
            onChange={handleChange}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='vehicleYear'>Vehicle Year</Label>
          <Input
            id='vehicleYear'
            name='vehicleYear'
            type='number'
            min='1900'
            max={new Date().getFullYear()}
            value={formData.vehicleYear}
            onChange={handleChange}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='licensePlate'>License Plate Number</Label>
          <Input
            id='licensePlate'
            name='licensePlate'
            value={formData.licensePlate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoStep;
