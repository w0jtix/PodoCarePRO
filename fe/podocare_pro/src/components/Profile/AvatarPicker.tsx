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
        <div className={`avatar-picker-container ${className ? className : ""}`}>
            {avatarKeys.map((key) => (
                <div 
                key={key}
                onClick={() => handleSelect(key)}
                className={`avatar-option ${currentAvatar === key ? "selected" : ""}`}
            
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