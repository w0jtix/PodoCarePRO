import React from 'react'
import { Alert } from '../../models/alert'


export function CustomAlert (props: Alert) {
  return (
    <div className={`custom-alert custom-alert-${props.variant}`}>
        <a className="alert-message">{props.message}</a>
    </div>
  )
}

export default CustomAlert
