import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface DocumentsStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DocumentsStep = ({ formData, setFormData }: DocumentsStepProps) => {
  const { userId } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File, type: string) => {
    if (!file || !userId) return;

    setUploading(true);
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("file", file);

      // Upload to API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { url } = await response.json();

      // Update form data with the file URL
      setFormData((prev: any) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: url, // Store the URL returned from the API
        },
      }));

      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium'>Required Documents</h3>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label>Driving License</Label>
          <Input
            type='file'
            accept='image/*,.pdf'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "drivingLicense");
            }}
            disabled={uploading}
          />
          {formData.documents.drivingLicense && (
            <p className='text-sm text-green-600'>
              Document uploaded successfully
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>Vehicle Registration</Label>
          <Input
            type='file'
            accept='image/*,.pdf'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "vehicleRegistration");
            }}
            disabled={uploading}
          />
          {formData.documents.vehicleRegistration && (
            <p className='text-sm text-green-600'>
              Document uploaded successfully
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>Insurance Document</Label>
          <Input
            type='file'
            accept='image/*,.pdf'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "insurance");
            }}
            disabled={uploading}
          />
          {formData.documents.insurance && (
            <p className='text-sm text-green-600'>
              Document uploaded successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;
