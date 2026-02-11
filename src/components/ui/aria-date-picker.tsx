"use client";

import {
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    DateInput,
    DatePicker,
    DateSegment,
    Dialog,
    Group,
    Heading,
    Label,
    Popover,
    DatePickerProps,
    DateValue
} from "react-aria-components";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AriaDatePickerProps<T extends DateValue> extends DatePickerProps<T> {
    label?: string;
    className?: string;
    groupClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    showButton?: boolean;
    openOnFieldClick?: boolean;
}

export function AriaDatePicker<T extends DateValue>({
    label,
    className,
    groupClassName,
    inputClassName,
    buttonClassName,
    showButton = true,
    openOnFieldClick = true,
    isOpen,
    onOpenChange,
    ...props
}: AriaDatePickerProps<T>) {
    const [internalOpen, setInternalOpen] = useState(false);
    const controlledOpen = isOpen !== undefined;
    const resolvedOpen = controlledOpen ? isOpen : internalOpen;

    const handleOpenChange = (open: boolean) => {
        if (!controlledOpen) {
            setInternalOpen(open);
        }
        onOpenChange?.(open);
    };

    return (
        <DatePicker
            {...props}
            isOpen={resolvedOpen}
            onOpenChange={handleOpenChange}
            className={cn("group flex flex-col gap-1 w-full", className)}
        >
            {label && <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>}
            <Group
                onClick={() => {
                    if (openOnFieldClick) {
                        handleOpenChange(true);
                    }
                }}
                className={cn(
                    "flex items-center w-full bg-card border border-border rounded-lg transition-colors focus-within:border-[#3f52ff] dark:focus-within:border-[#8faeff] h-9 px-3",
                    groupClassName
                )}
            >
                <DateInput className={cn("flex-1 flex bg-transparent outline-none text-sm text-foreground p-0", inputClassName)}>
                    {(segment) => (
                        <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-[#3f52ff] focus:text-white caret-transparent placeholder-shown:italic"
                        />
                    )}
                </DateInput>
                <Button
                    className={cn(
                        "outline-none text-muted-foreground group-focus-within:text-[#3f52ff] dark:text-white dark:group-focus-within:text-white",
                        !showButton && "hidden",
                        buttonClassName
                    )}
                >
                    <CalendarIcon className="w-4 h-4 cursor-pointer" />
                </Button>
            </Group>

            <Popover className="bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-3 overflow-auto max-w-xs">
                <Dialog className="outline-none">
                    <Calendar className="w-full">
                        <header className="flex items-center justify-between pb-4">
                            <Button slot="previous" className="p-1 rounded-md hover:bg-muted/70 outline-none">
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Heading className="text-sm font-semibold text-foreground" />
                            <Button slot="next" className="p-1 rounded-md hover:bg-muted/70 outline-none">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </header>
                        <CalendarGrid className="border-spacing-1 border-separate">
                            {(date) => (
                                <CalendarCell
                                    date={date}
                                    className={({ isSelected, isHovered, isOutsideVisibleRange }) => `
                    w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer outline-none
                    ${isOutsideVisibleRange ? "text-muted-foreground/50 pointer-events-none" : "text-foreground"}
                    ${isSelected ? "bg-[#3f52ff] text-white font-medium" : isHovered ? "bg-muted/70" : ""}
                  `}
                                />
                            )}
                        </CalendarGrid>
                    </Calendar>
                </Dialog>
            </Popover>
        </DatePicker>
    );
}
