"use client";
import React, { useState, useEffect } from "react";
import { Calendar, X, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  onDateSelect: (date: Date | undefined) => void;
  initialDate?: Date;
}

const DatePicker = ({ onDateSelect, initialDate }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(date);

  // Set default date to today if initialDate is not provided
  useEffect(() => {
    if (!initialDate && !date) {
      const today = new Date();
      setDate(today);
      setTempDate(today);
      onDateSelect(today);
      console.log("DatePicker - Setting default date to today:", today);
    }
  }, [initialDate, date, onDateSelect]);

  const handleSelect = (selectedDate: Date | undefined) => {
    console.log("DatePicker - Date selected:", selectedDate);
    setTempDate(selectedDate);
  };

  const handleConfirm = () => {
    setDate(tempDate);
    onDateSelect(tempDate);
    setIsSheetOpen(false);
    console.log("DatePicker - Date confirmed:", tempDate);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsSheetOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    setTempDate(undefined);
    onDateSelect(undefined);
    console.log("DatePicker - Date cleared");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Date</label>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-300 transition-colors">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-900">
                {date ? format(date, "EEEE, dd MMM yyyy") : "Select date"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {date && (
                <button
                  onClick={clearDate}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select Date</SheetTitle>
          </SheetHeader>

          <div className="py-6">
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={tempDate}
                onSelect={handleSelect}
                className="mx-auto"
                styles={{
                  caption: {
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  },
                  day: {
                    fontSize: "0.95rem",
                    margin: "0.2rem",
                    height: "2.5rem",
                    width: "2.5rem",
                    borderRadius: "0.5rem",
                  },
                  head: {
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    color: "#6B7280",
                  },
                }}
                fromDate={new Date()}
                modifiersStyles={{
                  selected: {
                    backgroundColor: "#3B82F6",
                    color: "white",
                    fontWeight: "600",
                  },
                  today: {
                    backgroundColor: "#EFF6FF",
                    color: "#3B82F6",
                    fontWeight: "600",
                  },
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!tempDate}
            >
              Confirm
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DatePicker;
