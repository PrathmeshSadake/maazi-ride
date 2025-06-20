"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (phoneNumber: string) => void;
  isLoading?: boolean;
}

export function PhoneNumberDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: PhoneNumberDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      onSubmit(phoneNumber);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "");

    // Limit to 10 digits
    const truncated = numericValue.slice(0, 10);

    // Format as XXX-XXX-XXXX if 10 digits
    if (truncated.length === 10) {
      return `${truncated.slice(0, 3)}-${truncated.slice(
        3,
        6
      )}-${truncated.slice(6)}`;
    } else if (truncated.length > 6) {
      return `${truncated.slice(0, 3)}-${truncated.slice(
        3,
        6
      )}-${truncated.slice(6)}`;
    } else if (truncated.length > 3) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    }

    return truncated;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const isValid = phoneNumber.replace(/\D/g, "").length === 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Phone Number Required</DialogTitle>
          <DialogDescription>
            Please provide your phone number to complete the booking. The driver
            will use this to contact you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="123-456-7890"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="col-span-3"
                maxLength={12}
              />
            </div>
            {phoneNumber && !isValid && (
              <p className="text-sm text-red-500 text-center">
                Please enter a valid 10-digit phone number
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
