import React from 'react'
import { Alert } from '../../models/alert'


export function CustomAlert (props: Alert) {
  return (
    <div className={`custom-alert flex justify-center align-items-center custom-alert-${props.variant}`}>
        <a className="alert-message flex justify-center">{props.message}</a>
    </div>
  )
}

export default CustomAlert
