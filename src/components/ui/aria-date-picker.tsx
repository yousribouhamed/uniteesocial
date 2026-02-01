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
            {label && <Label className="text-sm font-semibold text-[#22292f]">{label}</Label>}
            <Group className="flex items-center w-full bg-white border border-[#d5dde2] rounded-lg transition-colors focus-within:border-[#3f52ff] h-9 px-3">
                <DateInput className="flex-1 flex bg-transparent outline-none text-sm text-[#22292f] p-0">
                    {(segment) => (
                        <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-[#3f52ff] focus:text-white caret-transparent placeholder-shown:italic"
                        />
                    )}
                </DateInput>
                <Button className="outline-none text-[#859bab] group-focus-within:text-[#3f52ff]">
                    <CalendarIcon className="w-4 h-4 cursor-pointer" />
                </Button>
            </Group>

            <Popover className="bg-white rounded-lg shadow-lg border border-[#e5e7eb] p-3 overflow-auto max-w-xs">
                <Dialog className="outline-none">
                    <Calendar className="w-full">
                        <header className="flex items-center justify-between pb-4">
                            <Button slot="previous" className="p-1 rounded-md hover:bg-gray-100 outline-none">
                                <ChevronLeft className="w-4 h-4 text-[#516778]" />
                            </Button>
                            <Heading className="text-sm font-semibold text-[#22292f]" />
                            <Button slot="next" className="p-1 rounded-md hover:bg-gray-100 outline-none">
                                <ChevronRight className="w-4 h-4 text-[#516778]" />
                            </Button>
                        </header>
                        <CalendarGrid className="border-spacing-1 border-separate">
                            {(date) => (
                                <CalendarCell
                                    date={date}
                                    className={({ isSelected, isHovered, isOutsideVisibleRange }) => `
                    w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer outline-none
                    ${isOutsideVisibleRange ? "text-gray-300 pointer-events-none" : "text-[#22292f]"}
                    ${isSelected ? "bg-[#3f52ff] text-white font-medium" : isHovered ? "bg-gray-100" : ""}
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
