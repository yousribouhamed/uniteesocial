"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Camera,
  Clock,
  Globe,
  MapPin,
  Tag,
  Ticket,
  Users,
  ChevronDown,
  Pencil,
  Loader2,
} from "lucide-react";
import { AriaDatePicker } from "@/components/ui/aria-date-picker";
import { AriaSlider } from "@/components/ui/aria-slider";
import { AriaSwitch } from "@/components/ui/aria-switch";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { today, getLocalTimeZone, DateValue } from "@internationalized/date";
import { DEFAULT_CHAPTERS } from "@/data/chapters";

interface CreateEventScreenProps {
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
  isSaving?: boolean;
}

export interface EventFormData {
  title: string;
  coverImage: string;
  eventCategory: "general" | "match";
  startDate: DateValue | null;
  startTime: string;
  endDate: DateValue | null;
  endTime: string;
  locationType: "onsite" | "virtual";
  location: string;
  geoFenceRadius: number;
  locationMasking: boolean;
  locationMaskName: string;
  description: string;
  chapter: string;
  ticketGoLive: string;
  capacity: string;
  type: "Onsite" | "Online" | "Hybrid";
}

export function CreateEventScreen({ onClose, onSave, isSaving = false }: CreateEventScreenProps) {
  // Form state
  const [eventTitle, setEventTitle] = useState("Event name");
  const [eventCategory, setEventCategory] = useState<"general" | "match">("general");
  const [startDate, setStartDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [endTime, setEndTime] = useState("02:00");
  const [locationType, setLocationType] = useState<"onsite" | "virtual">("onsite");
  const [locationInput, setLocationInput] = useState("");
  const [geoFenceRadius, setGeoFenceRadius] = useState(650);
  const [locationMasking, setLocationMasking] = useState(false);
  const [locationMaskName, setLocationMaskName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [chapter, setChapter] = useState("Dubai");
  const [ticketGoLive, setTicketGoLive] = useState("Custom Date");
  const [capacity, setCapacity] = useState("Unlimited");
  const [coverImage, setCoverImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate duration
  const calculateDuration = () => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let hours = endH - startH;
    let minutes = endM - startM;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    if (hours < 0) hours += 24;
    if (minutes === 0) return `${hours} hours`;
    return `${hours}h ${minutes}m`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDateForDisplay = (date: DateValue | null) => {
    if (!date) return "lun. 24 nov.";
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const weekdays = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    const months = ["jan.", "fév.", "mar.", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    return `${weekdays[jsDate.getDay()]} ${date.day} ${months[date.month - 1]}`;
  };

  const handleSubmit = () => {
    onSave({
      title: eventTitle,
      coverImage,
      eventCategory,
      startDate,
      startTime,
      endDate,
      endTime,
      locationType,
      location: locationInput,
      geoFenceRadius,
      locationMasking,
      locationMaskName,
      description: eventDescription,
      chapter,
      ticketGoLive,
      capacity,
      type: locationType === "virtual" ? "Online" : "Onsite",
    });
  };

  return (
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg p-4 pb-2 flex flex-col gap-4">
      <div className="flex lg:flex-row flex-col gap-4">
        {/* Left: Cover Image Upload */}
        <div
          className="w-full lg:w-[469px] h-[264px] shrink-0 bg-white border border-dashed border-[#668091] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group"
          onClick={() => fileInputRef.current?.click()}
        >
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="Event cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-[69px] h-[69px] bg-[#3f52ff] border-[3.833px] border-white rounded-full flex items-center justify-center">
                  <Camera className="w-[30px] h-[30px] text-white" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-[69px] h-[69px] bg-[#3f52ff] border-[3.833px] border-white rounded-full flex items-center justify-center">
              <Camera className="w-[30px] h-[30px] text-white" />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* Right: Form Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Header Row: Event Type Tabs + Language Selector */}
          <div className="flex items-center justify-between">
            {/* Event Type Tabs */}
            <div className="flex items-center gap-1 bg-[#eceff2] p-1 rounded-lg">
              <button
                onClick={() => setEventCategory("general")}
                className={`relative h-9 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  eventCategory === "general"
                    ? "text-[#3f52ff]"
                    : "text-[#516778] hover:text-[#22292f]"
                }`}
              >
                {eventCategory === "general" && (
                  <motion.div
                    layoutId="eventTypeIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">General Event</span>
              </button>
              <button
                onClick={() => setEventCategory("match")}
                className={`relative h-9 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  eventCategory === "match"
                    ? "text-[#3f52ff]"
                    : "text-[#516778] hover:text-[#22292f]"
                }`}
              >
                {eventCategory === "match" && (
                  <motion.div
                    layoutId="eventTypeIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Match</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="w-[100px]">
              <AriaSelect aria-label="Language" defaultSelectedKey="English">
                <AriaSelectItem id="English" textValue="English">English</AriaSelectItem>
                <AriaSelectItem id="French" textValue="French">French</AriaSelectItem>
                <AriaSelectItem id="Arabic" textValue="Arabic">Arabic</AriaSelectItem>
              </AriaSelect>
            </div>
          </div>

          {/* Event Title */}
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="text-[40px] font-bold text-[#8faeff] leading-[46px] bg-transparent outline-none w-full placeholder:text-[#8faeff]"
            placeholder="Event name"
          />

          {/* Date/Time Section */}
          <div className="flex flex-col gap-2">
            <div className="flex sm:flex-row flex-col gap-2">
              {/* Start/End Date-Time */}
              <div className="flex-1 bg-white rounded-lg p-1 flex flex-col">
                {/* Start Row */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 flex flex-col items-center justify-center px-1">
                      <div className="w-[10px] h-[10px] bg-[#3f52ff] rounded-full" />
                    </div>
                    <span className="text-sm font-normal text-[#22292f]">Start</span>
                  </div>
                  <div className="flex gap-[2px] items-center">
                    <div className="bg-[#dbeaff] h-9 px-3 py-2 rounded-lg flex items-center justify-center">
                      <span className="text-base font-normal text-[#22292f]">{formatDateForDisplay(startDate)}</span>
                    </div>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#dbeaff] h-9 px-3 py-2 rounded-lg text-base font-normal text-[#22292f] w-[70px] text-center outline-none"
                    />
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="ml-[13px] h-4 border-l-[1.5px] border-dashed border-[#3f52ff]" />

                {/* End Row */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 flex flex-col items-center justify-center px-1">
                      <div className="w-[10px] h-[10px] border border-[#3f52ff] rounded-full" />
                    </div>
                    <span className="text-sm font-normal text-[#22292f]">End</span>
                  </div>
                  <div className="flex gap-[2px] items-center">
                    <div className="bg-[#dbeaff] h-9 px-3 py-2 rounded-lg flex items-center justify-center">
                      <span className="text-base font-normal text-[#22292f]">{formatDateForDisplay(endDate)}</span>
                    </div>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-[#dbeaff] h-9 px-3 py-2 rounded-lg text-base font-normal text-[#22292f] w-[70px] text-center outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="bg-white rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0">
                <Globe className="w-4 h-4 text-[#22292f]" />
                <span className="text-sm font-medium text-[#22292f]">GMT+01:00</span>
                <span className="text-xs font-normal text-[#668091]">Algiers</span>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-lg px-3 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#22292f]" />
              <span className="text-base font-medium text-[#22292f] flex-1">Duration</span>
              <span className="text-base font-medium text-[#668091]">{calculateDuration()}</span>
            </div>
          </div>

          {/* Event Location Section */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#3f52ff]">Event Location</span>

            {/* Location Type Tabs */}
            <div className="flex items-center gap-1 bg-[#eceff2] p-1 rounded-lg w-fit">
              <button
                onClick={() => setLocationType("onsite")}
                className={`relative h-9 px-8 py-2 rounded-lg text-sm font-medium transition-colors ${
                  locationType === "onsite"
                    ? "text-[#3f52ff]"
                    : "text-[#516778] hover:text-[#22292f]"
                }`}
              >
                {locationType === "onsite" && (
                  <motion.div
                    layoutId="locationTypeIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">On site</span>
              </button>
              <button
                onClick={() => setLocationType("virtual")}
                className={`relative h-9 px-8 py-2 rounded-lg text-sm font-medium transition-colors ${
                  locationType === "virtual"
                    ? "text-[#3f52ff]"
                    : "text-[#516778] hover:text-[#22292f]"
                }`}
              >
                {locationType === "virtual" && (
                  <motion.div
                    layoutId="locationTypeIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Virtual</span>
              </button>
            </div>

            {/* Location Content */}
            <div className="bg-white rounded-lg p-3 flex flex-col gap-6">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#22292f] mt-0.5" />
                <span className="text-base font-medium text-[#22292f]">Add event location</span>
              </div>

              {/* Location Input */}
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Enter the location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="h-9 px-3 border border-[#d5dde2] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff]"
                />
                <div className="flex items-center gap-2 text-xs text-[#859bab]">
                  <div className="w-3 h-3 border border-[#859bab] rounded-full" />
                  <span>Type to search (Google Typeahead Search integration)</span>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-[#e5e5e5]">
                <Image
                  src="/img/map-placeholder.jpg"
                  alt="Map"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Map Pin Icon Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#3f52ff] rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-[#3f52ff]" />
                  </div>
                </div>
                {/* Radius Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-[#3f52ff] rounded-full bg-[#3f52ff]/10" />
              </div>

              {/* Geo-Fence Radius */}
              <div className="flex flex-col gap-2">
                <AriaSlider
                  label="Geo-Fence Radius"
                  unit="meters"
                  minValue={0}
                  maxValue={1000}
                  value={geoFenceRadius}
                  onChange={(v) => setGeoFenceRadius(v as number)}
                />
                <p className="text-xs text-[#859bab] text-center">
                  Define the radius for location-based check-in verification
                </p>
              </div>

              {/* Location Masking */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-[#22292f]">Location Masking</span>
                    <span className="text-xs text-[#859bab]">Hide real location and show custom name</span>
                  </div>
                  <AriaSwitch
                    isSelected={locationMasking}
                    onChange={setLocationMasking}
                  />
                </div>

                {/* Additional Info Textarea */}
                <textarea
                  placeholder="Additional Informations"
                  value={locationMaskName}
                  onChange={(e) => setLocationMaskName(e.target.value)}
                  className="w-full h-[72px] px-3 py-2 border border-[#d5dde2] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#3f52ff]">Event Description</span>
            <div className="bg-white border border-[#d5dde2] rounded-lg p-3 flex flex-col gap-2">
              <textarea
                placeholder="Placeholder"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                maxLength={280}
                className="w-full h-[100px] text-sm text-[#22292f] placeholder:text-[#859bab] outline-none resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#859bab]">{eventDescription.length}/280 characters</span>
                <button className="text-[#859bab] hover:text-[#516778]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.333 8.667V12.667C13.333 13.0203 13.1927 13.3594 12.9426 13.6095C12.6925 13.8595 12.3536 14 12 14H3.333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.667V4C2 3.64638 2.14048 3.30724 2.39052 3.05719C2.64057 2.80714 2.97971 2.667 3.333 2.667H7.333" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.333 1.333L14.666 4.666L8 11.333H4.667V8L11.333 1.333Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#3f52ff]">Additional Options</span>
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Event Chapter */}
              <div className="px-3 py-2 flex items-center gap-2 border-b border-[#f0f2f4]">
                <Tag className="w-4 h-4 text-[#22292f]" />
                <span className="text-base font-medium text-[#22292f] flex-1">Event Chapter</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-[#668091]">{chapter}</span>
                  <ChevronDown className="w-4 h-4 text-[#668091]" />
                </div>
              </div>

              {/* Tickets Go Live */}
              <div className="px-3 py-2 flex items-center gap-2 border-b border-[#f0f2f4]">
                <Ticket className="w-4 h-4 text-[#22292f]" />
                <span className="text-base font-medium text-[#22292f] flex-1">When tickets should go live?</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-[#668091]">{ticketGoLive}</span>
                  <ChevronDown className="w-4 h-4 text-[#668091]" />
                </div>
              </div>

              {/* Capacity */}
              <div className="px-3 py-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#22292f]" />
                <span className="text-base font-medium text-[#22292f] flex-1">Capacity</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-[#668091]">{capacity}</span>
                  <Pencil className="w-4 h-4 text-[#668091]" />
                </div>
              </div>
            </div>
          </div>

          {/* Create Event Button */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full h-10 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "+ Create Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
