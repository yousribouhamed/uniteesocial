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
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isFocusVisible ? "ring-2 ring-[#3f52ff] dark:ring-[#8faeff] ring-offset-2 ring-offset-background" : ""
                            } ${isSelected || isIndeterminate
                                ? "bg-[#3f52ff] border-[#3f52ff]"
                                : "bg-card border-border group-hover:border-muted-foreground/60"
                            }`}
                    >
                        {isSelected && !isIndeterminate && <Check className="w-3 h-3 text-white" />}
                        {isIndeterminate && <Minus className="w-3 h-3 text-white" />}
                    </div>
                    {children && (
                        <span className="text-sm text-foreground select-none">{children}</span>
                    )}
                </>
            )}
        </Checkbox>
    );
}
