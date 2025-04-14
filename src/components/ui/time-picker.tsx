"use client";

import { Clock } from "lucide-react";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  // Generate hour options (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Generate minute options (00-55 in 5-minute increments)
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );

  const [hour, minute] = value ? value.split(":") : ["12", "00"];

  return (
    <div className='flex items-center space-x-2'>
      <Clock className='h-4 w-4 text-muted-foreground' />
      <Select
        value={hour}
        onValueChange={(newHour) => onChange(`${newHour}:${minute}`)}
      >
        <SelectTrigger className='w-[70px]'>
          <SelectValue placeholder='Hour' />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className='text-muted-foreground'>:</span>
      <Select
        value={minute}
        onValueChange={(newMinute) => onChange(`${hour}:${newMinute}`)}
      >
        <SelectTrigger className='w-[70px]'>
          <SelectValue placeholder='Min' />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
