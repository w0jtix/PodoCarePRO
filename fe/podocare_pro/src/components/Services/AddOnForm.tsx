import { Action } from "../../models/action";
import { BaseServiceAddOn, NewBaseServiceAddOn } from "../../models/service";
import { useState, useEffect, useCallback } from "react";
import TextInput from "../TextInput";
import DigitInput from "../DigitInput";

export interface AddOnFormProps {
    setAddOnDTO: React.Dispatch<
        React.SetStateAction<NewBaseServiceAddOn | BaseServiceAddOn>
      >;
    action: Action;
    addOnDTO: BaseServiceAddOn | NewBaseServiceAddOn;
    className?:string;
}

export function AddOnForm({
    setAddOnDTO,
    action,
    addOnDTO,
    className=""
}: AddOnFormProps) {
    

    const handleNameChange = useCallback((name: string) => {
            setAddOnDTO((prev) => ({
                ...prev,
                name: name,
            }))
        }, []);

    const handlePriceChange = useCallback((price: number |null) => {
        if(price === null) {
            price = 0;
        }
        setAddOnDTO((prev) => ({
            ...prev,
            price: price,
        }))
    }, []);

    const handleDurationChange = useCallback((duration: number | null) => {
        if(duration === null) {
            duration = 0;
        }

        setAddOnDTO((prev) => ({
            ...prev,
            duration: duration,
        }))
    }, []);

    return (
            <div className={`custom-form-container flex-column width-max g-05 ${action.toString().toLowerCase()} ${className}`}>
                <section className="form-row flex width-max align-items-center space-between">
                    <span className="input-label">Nazwa:</span>
                    <TextInput
                    dropdown={false}
                    value={addOnDTO.name}
                    onSelect={(inputName) => {
                        if (typeof inputName === "string") {
                            handleNameChange(inputName);
                        }
                    }}
                    className="name"
                    />
                </section>
                <section className="form-row flex width-max align-items-center space-between">
                    <span className="input-label">Czas trwania:</span>
                    <DigitInput
                        onChange={handleDurationChange}
                        value={addOnDTO.duration} 
                        max={999}
                        className={"service"}
                    />
                </section>
                <section className="form-row flex width-max align-items-center space-between">
                    <span className="input-label">Cena:</span>
                    <DigitInput
                        onChange={handlePriceChange}
                        value={addOnDTO.price} 
                        max={999}
                        className={"service"}
                    />
                </section>
                
            </div>
        )
    
}

export default AddOnForm;