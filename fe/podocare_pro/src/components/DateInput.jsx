import React from "react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pl } from "date-fns/locale";

const DateInput = ({ onChange, selectedDate, showPlaceholder = false }) => {

  const initialDate =
    selectedDate
      ? new Date(selectedDate)
      : showPlaceholder
      ? null
      : new Date();


  const [orderDate, setOrderDate] = useState(initialDate);

  const handleDateChange = (date) => {
    onChange(date);
  };

  useEffect(() => {
    if (selectedDate === null) {
      setOrderDate(null);
    } else if (selectedDate) {
      const dateObj = new Date(selectedDate);
      if (!orderDate || dateObj.getTime() !== orderDate.getTime()) {
        setOrderDate(dateObj);
      }
    }
  }, [selectedDate]);

  return (
    <div className="input-date-component">
      <DatePicker
        id="order-date"
        selected={orderDate}
        onChange={handleDateChange}
        customInput={
          <button
            className={`custom-calendar-button ${orderDate ? "selected" : ""}`}
          >
            <img
              src="src/assets/calendar.svg"
              alt="Calendar"
              className={`calendar-icon ${orderDate ? "selected" : ""}`}
            />
            {orderDate ? orderDate.toLocaleDateString("pl-PL") : "DD-MM-YYYY"}
          </button>
        }
        dateFormat="dd-MM-yyyy"
        className="date-custom-input"
        calendarClassName="date-custom-calendar"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        locale={pl}
      />
    </div>
  );
};

export default DateInput;
