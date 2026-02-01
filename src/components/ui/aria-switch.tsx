"use client";

import { Switch, SwitchProps } from "react-aria-components";

interface AriaSwitchProps extends SwitchProps {
    children?: React.ReactNode;
}

export function AriaSwitch({ children, className, ...props }: AriaSwitchProps) {
    return (
        <Switch
            {...props}
            className={`group flex items-center gap-2 text-sm font-semibold text-[#22292f] cursor-pointer ${className}`}
        >
            <div className="w-11 h-6 bg-[#d5dde2] rounded-full p-1 transition-colors duration-200 group-selected:bg-[#3f52ff]">
                <div className="bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 group-selected:translate-x-5" />
            </div>
            {children}
        </Switch>
    );
}
