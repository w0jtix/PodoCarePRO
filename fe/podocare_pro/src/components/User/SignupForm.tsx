import React from "react";
import TextInput from "../TextInput";
import { useState, useEffect, useCallback } from "react";
import { Supplier, NewSupplier } from "../../models/supplier";
import { RegisterRequest } from "../../models/register";

export interface SignupFormProps {
  signupRequest: RegisterRequest;
  setSignupRequest: React.Dispatch<React.SetStateAction<RegisterRequest>>;
  className?: string;
}

export function SignupForm ({ 
  signupRequest, 
  setSignupRequest,
  className=""
 }: SignupFormProps) {

  const handleUsername = useCallback((username: string) => {
    setSignupRequest((prev) => ({
      ...prev,
      username,
    }));
  }, []);
  const handlePassword = useCallback((password: string) => {
    setSignupRequest((prev) => ({
      ...prev,
      password,
    }));
  }, []);


  return (
    <div className={`width-90 flex-column ${className}`}>
      <section className="width-max flex mt-2 mb-2">
        <ul className="width-max flex-column p-0 mt-0 mb-0 align-self-center g-1">
          <li className="popup-common-section-row align-items-center space-between mt-15 name flex">
            <a className="supplier-form-input-title">Username:</a>
            <TextInput
              dropdown={false}
              value={signupRequest.username}
              onSelect={(username) => {
                if (typeof username === "string") {
                  handleUsername(username);
                }
              }}
              className="name"
            />
          </li>
          <li className="popup-common-section-row align-items-center space-between mt-15  name flex">
            <a className="supplier-form-input-title">Hasło:</a>
            <TextInput
              dropdown={false}
              value={signupRequest.password}
              onSelect={(pw) => {
                if (typeof pw === "string") {
                  handlePassword(pw);
                }
              }}
              className="name"
              password={true}
            />
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SignupForm;
