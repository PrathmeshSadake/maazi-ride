"use client";
import React, { useState } from "react";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  onDateSelect: (date: Date | undefined) => void;
  initialDate?: Date;
}

const DatePicker = ({ onDateSelect, initialDate }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onDateSelect(selectedDate);
    setIsCalendarOpen(false);
  };

  const clearDate = () => {
    setDate(undefined);
    onDateSelect(undefined);
  };

  return (
    <div className='relative'>
      <div className='flex items-center space-x-2 bg-gray-100 py-2 px-4 rounded-lg shadow-sm'>
        <Calendar className='h-5 w-5 text-gray-500' />
        <div
          className='flex-1 outline-none cursor-pointer text-sm'
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          {date ? format(date, "dd MMM yyyy") : "Select date"}
        </div>
        {date && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDate();
            }}
            className='text-gray-400 hover:text-gray-600'
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isCalendarOpen && (
        <div className='absolute z-50 mt-1 bg-white rounded-lg shadow-lg p-2 border border-gray-200'>
          <DayPicker
            mode='single'
            selected={date}
            onSelect={handleSelect}
            styles={{
              caption: { fontSize: "0.9rem" },
              day: {
                fontSize: "0.9rem",
                margin: "0.1rem",
                height: "2rem",
                width: "2rem",
              },
              head: { fontSize: "0.8rem" },
            }}
            fromDate={new Date()}
            modifiersStyles={{
              selected: {
                backgroundColor: "#3B82F6",
                color: "white",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
