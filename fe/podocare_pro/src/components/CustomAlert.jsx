import React from 'react'


const CustomAlert = ({ message, variant }) => {
  return (
    <div className={`custom-alert custom-alert-${variant}`}>
        <a className="alert-message">{message}</a>
    </div>
  )
}

export default CustomAlert
