"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  onComplete,
  onChange,
  className,
  disabled = false,
  autoFocus = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Call onChange if provided
    onChange?.(newOtp.join(""));

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all fields are filled
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const digits = pasteData.replace(/\D/g, "").slice(0, length);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();

      // Call onComplete if all fields are filled
      if (newOtp.every((digit) => digit !== "")) {
        onComplete(newOtp.join(""));
      }
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center border-2 rounded-lg font-semibold text-lg",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
            digit ? "border-blue-500 bg-blue-50" : "border-gray-300"
          )}
          maxLength={1}
        />
      ))}
    </div>
  );
}
