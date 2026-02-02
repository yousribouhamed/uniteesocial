"use client";

import React from "react";
import { Checkbox, CheckboxProps } from "react-aria-components";
import { Check, Minus } from "lucide-react";

interface AriaCheckboxProps extends CheckboxProps {
    children?: React.ReactNode;
    className?: string;
}

export function AriaCheckbox({ children, className, ...props }: AriaCheckboxProps) {
    return (
        <Checkbox
            {...props}
            className={`group flex items-center gap-2 cursor-pointer ${className || ""}`}
        >
            {({ isSelected, isIndeterminate, isFocusVisible }) => (
                <>
                    <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isFocusVisible ? "ring-2 ring-[#3f52ff] ring-offset-2" : ""
                            } ${isSelected || isIndeterminate
                                ? "bg-[#3f52ff] border-[#3f52ff]"
                                : "bg-white border-[#d5dde2] group-hover:border-[#b0bfc9]"
                            }`}
                    >
                        {isSelected && !isIndeterminate && <Check className="w-3 h-3 text-white" />}
                        {isIndeterminate && <Minus className="w-3 h-3 text-white" />}
                    </div>
                    {children && (
                        <span className="text-sm text-[#22292f] select-none">{children}</span>
                    )}
                </>
            )}
        </Checkbox>
    );
}
