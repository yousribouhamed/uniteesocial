"use client";

import React from "react";
import {
    Button,
    Label,
    ListBox,
    ListBoxItem,
    Popover,
    Select,
    SelectValue,
    SelectProps,
    ValidationResult,
    ListBoxItemProps
} from "react-aria-components";
import { ChevronDown, Check } from "lucide-react";

interface AriaSelectProps<T extends object> extends Omit<SelectProps<T>, "children"> {
    label?: string;
    description?: string;
    errorMessage?: string | ((validation: ValidationResult) => string);
    items?: Iterable<T>;
    children: React.ReactNode | ((item: T) => React.ReactNode);
    className?: string;
}

export function AriaSelect<T extends object>({
    label,
    description,
    errorMessage,
    children,
    items,
    className,
    ...props
}: AriaSelectProps<T>) {
    return (
        <Select {...props} className={`flex flex-col gap-1 w-full ${className}`}>
            {label && <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>}
            <Button className="flex items-center justify-between w-full h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] transition-colors data-[pressed]:bg-muted/70 cursor-pointer">
                <SelectValue className="flex-1 text-left truncate placeholder-shown:text-muted-foreground" />
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
            </Button>
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
            <Popover className="w-[--trigger-width] bg-popover text-popover-foreground border border-border rounded-lg shadow-lg overflow-auto p-1 max-h-60 z-50 transform origin-top transition duration-200 ease-out data-[entering]:scale-95 data-[entering]:opacity-0 data-[exiting]:scale-95 data-[exiting]:opacity-0">
                <ListBox items={items} className="outline-none flex flex-col gap-0.5 w-full">
                    {children}
                </ListBox>
            </Popover>
        </Select>
    );
}

export function AriaSelectItem(props: ListBoxItemProps) {
    return (
        <ListBoxItem
            {...props}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground outline-none cursor-pointer data-[focused]:bg-muted/70 data-[focused]:text-foreground data-[selected]:font-semibold data-[selected]:bg-[#3f52ff] data-[selected]:text-white`}
        >
            {({ isSelected }) => (
                <>
                    <span className="flex-1 truncate">{typeof props.children === 'string' ? props.children : props.textValue}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </>
            )}
        </ListBoxItem>
    );
}
