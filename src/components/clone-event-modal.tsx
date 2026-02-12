"use client";

import React, { useState } from "react";
import { X, Globe, Info } from "lucide-react";
import { AriaDatePicker } from "@/components/ui/aria-date-picker";
import { today, getLocalTimeZone, DateValue } from "@internationalized/date";
import { motion } from "framer-motion";

interface CloneEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClone: (startDate: DateValue | null, startTime: string, endDate: DateValue | null, endTime: string) => void;
    eventTitle?: string;
}

/**
 * Clone Event Modal - allows user to select new start/end dates for cloning an event.
 * Matches Figma design at node 1818:15305.
 */
export function CloneEventModal({ isOpen, onClose, onClone, eventTitle }: CloneEventModalProps) {
    const [cloneStartDate, setCloneStartDate] = useState<DateValue | null>(today(getLocalTimeZone()));
    const [cloneStartTime, setCloneStartTime] = useState("00:00");
    const [cloneEndDate, setCloneEndDate] = useState<DateValue | null>(today(getLocalTimeZone()));
    const [cloneEndTime, setCloneEndTime] = useState("02:00");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="relative bg-white border border-[#d5dde2] rounded-xl w-full max-w-[580px] flex flex-col gap-4 shadow-xl"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                data-name="Modal"
                data-node-id="1818:15305"
            >
                {/* Modal Header */}
                <div className="bg-white border-b border-[#d5dde2] rounded-t-xl pt-4 pb-4 px-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="bg-[#d8e6ff] border border-[#8faeff] rounded-[9px] p-3 flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="#3f52ff" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.33333 10H2.66666C2.31304 10 1.9739 9.85953 1.72385 9.60948C1.4738 9.35943 1.33333 9.0203 1.33333 8.66667V2.66667C1.33333 2.31305 1.4738 1.97391 1.72385 1.72386C1.9739 1.47381 2.31304 1.33334 2.66666 1.33334H8.66666C9.02028 1.33334 9.35942 1.47381 9.60947 1.72386C9.85952 1.97391 9.99999 2.31305 9.99999 2.66667V3.33334" stroke="#3f52ff" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        {/* Title & Description */}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-semibold text-[#22292f] leading-tight">Clone Event</h3>
                            <p className="text-[13px] font-normal text-[#516778] leading-snug">
                                Everything except the guest list and event blasts will be copied over.
                            </p>
                        </div>
                    </div>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f0f2f5] transition-colors"
                    >
                        <X className="w-5 h-5 text-[#859bab]" />
                    </button>
                </div>

                {/* Body: Date/Time Section */}
                <div className="px-4 pb-4 flex flex-col gap-4">
                    <div className="flex items-stretch gap-4">
                        {/* Start / End Column */}
                        <div className="flex-1 flex flex-col relative">
                            {/* Start Row */}
                            <div className="flex items-center gap-4 py-2">
                                {/* Blue dot */}
                                <div className="flex flex-col items-center gap-1 shrink-0 w-3">
                                    <div className="w-3 h-3 rounded-full bg-[#3f52ff]" />
                                </div>
                                <span className="text-sm font-medium text-[#22292f] w-10">Start</span>
                                <div className="flex-1 max-w-[136px]">
                                    <AriaDatePicker value={cloneStartDate} onChange={setCloneStartDate} />
                                </div>
                                <input
                                    type="text"
                                    value={cloneStartTime}
                                    onChange={(e) => setCloneStartTime(e.target.value)}
                                    className="bg-[#d8e6ff] rounded-lg px-2 py-2 text-sm font-normal text-[#22292f] w-[60px] text-center outline-none focus:ring-1 focus:ring-[#3f52ff]"
                                />
                            </div>

                            {/* Dotted line connector */}
                            <div className="absolute left-[5.5px] top-[26px] bottom-[26px] w-px border-l border-dashed border-[#859bab]" />

                            {/* End Row */}
                            <div className="flex items-center gap-4 py-2">
                                {/* Empty circle */}
                                <div className="flex flex-col items-center gap-1 shrink-0 w-3">
                                    <div className="w-3 h-3 rounded-full border-2 border-[#859bab] bg-white" />
                                </div>
                                <span className="text-sm font-medium text-[#22292f] w-10">End</span>
                                <div className="flex-1 max-w-[136px]">
                                    <AriaDatePicker value={cloneEndDate} onChange={setCloneEndDate} />
                                </div>
                                <input
                                    type="text"
                                    value={cloneEndTime}
                                    onChange={(e) => setCloneEndTime(e.target.value)}
                                    className="bg-[#d8e6ff] rounded-lg px-2 py-2 text-sm font-normal text-[#22292f] w-[60px] text-center outline-none focus:ring-1 focus:ring-[#3f52ff]"
                                />
                            </div>
                        </div>

                        {/* Timezone Column */}
                        <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-lg p-3 flex flex-col items-center justify-center gap-1 w-[100px] shrink-0">
                            <Globe className="w-4 h-4 text-[#22292f]" />
                            <span className="text-sm font-medium text-[#22292f] whitespace-nowrap">GMT+01:00</span>
                            <span className="text-xs font-normal text-[#668091]">Algiers</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#e3e8ed]">
                        {/* Duration Info Pill */}
                        <div className="flex items-center gap-2 bg-[#d8e6ff] rounded-full px-3 py-1.5">
                            <Info className="w-4 h-4 text-[#3f52ff] dark:text-white" />
                            <span className="text-[13px] font-medium text-[#3f52ff] dark:text-white">
                                The event duration (8 hours) will be preserved
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="h-9 px-4 rounded-lg text-sm font-medium text-[#516778] hover:bg-[#f0f2f5] transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => onClone(cloneStartDate, cloneStartTime, cloneEndDate, cloneEndTime)}
                                className="h-9 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
                            >
                                Clone Event
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
