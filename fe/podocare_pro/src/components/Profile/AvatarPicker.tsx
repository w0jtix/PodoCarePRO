import { useState } from "react";
import { AVAILABLE_AVATARS } from "../../constants/avatars";

interface AvatarPickerProps {
    currentAvatar: string | undefined;
    onSelect:(avatar: string) => void;
    className?: string;
}

export function AvatarPicker ({ currentAvatar = "avatar5.png", onSelect, className="" }: AvatarPickerProps) {

    const handleSelect = (avatar: string) => {
        onSelect(avatar);
    };

    const avatarKeys = Object.keys(AVAILABLE_AVATARS);

    return (
        <div className={`avatar-picker-container grid justify-center align-self-start p-1 ${className ? className : ""}`}>
            {avatarKeys.map((key) => (
                <div 
                key={key}
                onClick={() => handleSelect(key)}
                className={`avatar-option pointer flex align-items-center justify-center ${currentAvatar === key ? "selected" : ""}`}
            
            >
                <img 
                src={AVAILABLE_AVATARS[key]}
                alt={key}
                className={`avatar-picker-image ${currentAvatar === key ? "selected" : ""}`}
                />
            </div>
            ))}
        </div>
    )
}