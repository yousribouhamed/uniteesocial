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

interface AriaDatePickerProps<T extends DateValue> extends DatePickerProps<T> {
    label?: string;
}

export function AriaDatePicker<T extends DateValue>({
    label,
    ...props
}: AriaDatePickerProps<T>) {
    return (
        <DatePicker {...props} className="group flex flex-col gap-1 w-full">
            {label && <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>}
            <Group className="flex items-center w-full bg-card border border-border rounded-lg transition-colors focus-within:border-[#3f52ff] dark:focus-within:border-[#8faeff] h-9 px-3">
                <DateInput className="flex-1 flex bg-transparent outline-none text-sm text-foreground p-0">
                    {(segment) => (
                        <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-[#3f52ff] focus:text-white caret-transparent placeholder-shown:italic"
                        />
                    )}
                </DateInput>
                <Button className="outline-none text-muted-foreground group-focus-within:text-[#3f52ff] dark:group-focus-within:text-white">
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
