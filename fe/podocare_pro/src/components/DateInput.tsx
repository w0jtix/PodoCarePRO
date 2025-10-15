import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pl } from "date-fns/locale";

export interface DateInputProps {
  onChange: (formattedDate: string | null) => void;
  selectedDate?: Date | string | null;
  showPlaceholder?: boolean;
}

const DateInput = ({
  onChange,
  selectedDate,
  showPlaceholder = false,
}: DateInputProps) => {
  const initialDate = selectedDate
    ? new Date(selectedDate)
    : showPlaceholder
    ? null
    : new Date();

  const [orderDate, setOrderDate] = useState<Date | null>(initialDate);

  const formatForBackend = (date: Date | null): string | null => {
    if (!date) return null;

    return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0');
  };

  const handleDateChange = useCallback((date: Date | null) => {
    setOrderDate(date);
    onChange(formatForBackend(date));
  }, []);

  useEffect(() => {
    if (selectedDate === null) {
      setOrderDate(null);
    } else if (selectedDate) {
      const dateObj = new Date(selectedDate);
      if (!orderDate || dateObj.getTime() !== orderDate.getTime()) {
        setOrderDate(dateObj);
      }
    }
  }, [selectedDate, orderDate]);

  return (
    <div className="input-date-component transparent border-none align-items-center">
      <DatePicker
        id="order-date"
        selected={orderDate}
        onChange={handleDateChange}
        customInput={
          <button
            className={`custom-calendar-button flex pointer transparent border-none align-items-center ${orderDate ? "selected" : ""}`}
          >
            <img
              src="src/assets/calendar.svg"
              alt="Calendar"
              className={`calendar-icon pointer ${orderDate ? "selected" : ""}`}
            />
            {orderDate ? orderDate.toLocaleDateString("pl-PL") : "DD-MM-YYYY"}
          </button>
        }
        dateFormat="dd-MM-yyyy"
        className="date-custom-input text-align-center"
        calendarClassName="date-custom-calendar transparent"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        locale={pl}
      />
    </div>
  );
};

export default DateInput;
