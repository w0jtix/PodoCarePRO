import React from "react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pl } from "date-fns/locale";

const DateInput = ({ onChange }) => {
  const [orderDate, setOrderDate] = useState(new Date());

  const handleDateChange = (date) => {
    setOrderDate(date);
    onChange(date);
  };

  useEffect(() => {
    onChange(orderDate);
  }, []);

  return (
    <div className="input-date-component">
      <DatePicker
        id="order-date"
        selected={orderDate}
        onChange={handleDateChange}
        customInput={
          <button className="custom-calendar-button">
            <img
              src="src/assets/calendar.svg"
              alt="Calendar"
              className="calendar-icon"
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
