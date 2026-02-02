"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Users,
  ClipboardPenLine,
  Plus,
  MapPin,
  ChevronDown,
  MoreVertical,
  Camera,
  Clock,
  Globe,
  Info,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { AriaDatePicker } from "@/components/ui/aria-date-picker";
import { AriaCheckbox } from "@/components/ui/aria-checkbox";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { today, getLocalTimeZone, DateValue } from "@internationalized/date";
import { toastQueue } from "@/components/ui/aria-toast";
import { DEFAULT_CHAPTERS } from "@/data/chapters";

// --- Types ---
interface EventItem {
  id: string;
  title: string;
  coverImage: string;
  chapter: string;
  type: "Onsite" | "Online" | "Hybrid";
  eventCategory: "general" | "match";
  date?: string;
  dateIso?: string; // Added for filtering
  location: string;
  signups: number;
  maxSignups: number;
  dateGroup: string;
}

interface EventsPageClientProps {
  currentUser: {
    email: string | undefined;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// --- Mock Events Data ---
const mockEvents: EventItem[] = [
  {
    id: "1",
    title: "Ignite Your Potential: Leadership Summit",
    coverImage: "/img/event-cover-1.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    date: "Sunday, April 17 - 17, 2024",
    dateIso: "2024-04-17",
    location: "Al Maktoum Airport, Jebel Ali",
    signups: 18,
    maxSignups: 300,
    dateGroup: "25 Oct. Saturday",
  },
  {
    id: "2",
    title: "Innovate & Elevate: Tech Conference 2024",
    coverImage: "/img/event-cover-2.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "Dubai World Trade Center, DWC",
    dateIso: "2024-10-25",
    signups: 88,
    maxSignups: 300,
    dateGroup: "25 Oct. Saturday",
  },
  {
    id: "3",
    title: "Empower & Thrive: Women in Business Forum",
    coverImage: "/img/event-cover-3.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "Dubai Creek Harbour, Ras Al Khor",
    dateIso: "2024-10-24",
    signups: 12,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
  {
    id: "4",
    title: "Create the Future: Design Thinking Workshop",
    coverImage: "/img/event-cover-4.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "Dubai Design District, D3",
    dateIso: "2024-10-24",
    signups: 99,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
  {
    id: "5",
    title: "Connect & Grow: Networking Mixer for Professionals",
    coverImage: "/img/event-cover-5.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "Dubai Marina Mall, Dubai",
    dateIso: "2024-10-24",
    signups: 44,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
  {
    id: "6",
    title: "Build Your Brand: Social Media Marketing Masterclass",
    coverImage: "/img/event-cover-6.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "general",
    location: "Burj Khalifa, Downtown Dubai",
    dateIso: "2024-10-24",
    signups: 72,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
  {
    id: "7",
    title: "Achieve Peak Performance: Mindfulness & Productivity",
    coverImage: "/img/event-cover-7.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "Emirates Towers, Trade Centre",
    dateIso: "2024-10-24",
    signups: 28,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
  {
    id: "8",
    title: "Shape Tomorrow: Sustainable Solutions Conference",
    coverImage: "/img/event-cover-8.jpg",
    chapter: "Dubai Chapter",
    type: "Onsite",
    eventCategory: "match",
    location: "City Walk, Al Safa",
    dateIso: "2024-10-24",
    signups: 65,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
];

// --- Guest Types & Mock Data ---
interface GuestItem {
  id: string;
  name: string;
  email: string;
  registrationTime: string;
  ticketId: string;
  status: "checked-in" | "not-checked-in" | "booked" | "cancelled";
}

const mockGuests: GuestItem[] = [
  { id: "g1", name: "Kenton J. Booker", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "234567", status: "booked" },
  { id: "g2", name: "Antonietta O'Connell", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "789123", status: "checked-in" },
  { id: "g3", name: "Brigid Jerde", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "21654", status: "booked" },
  { id: "g4", name: "Doug Steuber", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "654987", status: "not-checked-in" },
  { id: "g5", name: "Eusebio Crona", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "987456", status: "not-checked-in" },
  { id: "g6", name: "Elenora Kuhlman", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "123789", status: "not-checked-in" },
  { id: "g7", name: "Mafalda Windler", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "456789", status: "cancelled" },
  { id: "g8", name: "Crysta Crist", email: "crysta.crist@gmail.com", registrationTime: "10/12/2024 - 12:34", ticketId: "789456", status: "checked-in" },
];

// --- Create Event View ---
function CreateEventView({ event, onClose, onSave }: { event: EventItem | null; onClose: () => void; onSave: (event: EventItem) => void }) {
  const [detailTab, setDetailTab] = useState<"overview" | "guests" | "analytics" | "advanced">("overview");
  const [eventTitle, setEventTitle] = useState(event?.title || "New Event");
  const [chapter, setChapter] = useState(event?.chapter || "Dubai Chapter");
  const [type, setType] = useState<"Onsite" | "Online" | "Hybrid">(event?.type || "Onsite");
  const [startDate, setStartDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [endTime, setEndTime] = useState("02:00");
  const [locationInput, setLocationInput] = useState(event?.location || "");
  const [geoFenceRadius, setGeoFenceRadius] = useState(650);
  const [locationMasking, setLocationMasking] = useState(false);
  const [locationDescription, setLocationDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur. Et at quam phasellus accumsan neque tempus tincidunt tellus nulla. At consectetur sollicitudin at fames. Tristique molestie enim facilisi egestas."
  );
  const [eventDescription, setEventDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur. Et at quam phasellus accumsan neque tempus tincidunt tellus nulla. At consectetur sollicitudin at fames. Tristique molestie enim facilisi egestas."
  );
  const [coverImage, setCoverImage] = useState(event?.coverImage || "/img/event-cover-1.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest tab state
  const [guests] = useState<GuestItem[]>(mockGuests);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [guestStatusFilter, setGuestStatusFilter] = useState<string>("all");
  const [guestPage, setGuestPage] = useState(1);
  const guestsPerPage = 8;

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

  const getDayAndMonth = (date: DateValue | null | string) => {
    if (!date) return { day: "25", month: "OCT." };

    if (typeof date === 'object' && 'day' in date) {
      const monthNames = ["JAN.", "FEV.", "MAR.", "AVR.", "MAI.", "JUI.", "JUL.", "AOU.", "SEP.", "OCT.", "NOV.", "DEC."];
      return {
        day: date.day.toString(),
        month: monthNames[date.month - 1]
      };
    }

    const dateStr = date as string;
    const dayMatch = dateStr.match(/\d+/);
    const day = dayMatch ? dayMatch[0] : "25";

    const monthPatterns: { [key: string]: string } = {
      jan: "JAN.", feb: "FEV.", mar: "MAR.", apr: "AVR.", may: "MAI.", jun: "JUI.",
      jul: "JUL.", aug: "AOU.", sep: "SEP.", oct: "OCT.", nov: "NOV.", dec: "DEC.",
      janv: "JAN.", févr: "FEV.", mars: "MAR.", avr: "AVR.", mai: "MAI.", juin: "JUI.",
      juil: "JUI.", août: "AOU.", sept: "SEP.", octo: "OCT.", nove: "NOV.", déc: "DEC.",
      january: "JAN.", february: "FEV.", march: "MAR.", april: "AVR.", june: "JUI.",
      july: "JUL.", august: "AOU.", september: "SEP.", october: "OCT.", november: "NOV.", december: "DEC."
    };

    const words = dateStr.toLowerCase().split(/[^a-zÀ-ÿ0-9]/);
    let month = "OCT.";
    for (const word of words) {
      if (word.length < 2) continue;
      // Check for exact matches or prefix matches
      for (const [key, value] of Object.entries(monthPatterns)) {
        if (word.startsWith(key)) {
          month = value;
          break;
        }
      }
    }
    return { day, month };
  };

  const { day: displayDay, month: displayMonth } = getDayAndMonth(startDate);

  return (
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg p-3 pb-4 flex flex-col gap-4">
      {/* Header: Title + Badges + Check-In Guests */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#22292f] leading-[18px]">
            {eventTitle}
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 h-5 px-2 bg-[#112755] text-white text-[10px] font-medium rounded-[4px] leading-none">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
              </svg>
              {chapter}
            </span>
            <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-medium rounded-[4px] leading-none">
              {type}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
          Check-In Guests
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#eceff2] p-1 rounded-lg w-fit">
          {(["overview", "guests", "analytics", "advanced"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`relative h-7 px-3 text-sm font-medium rounded-md transition-colors z-10 ${detailTab === tab
                ? "text-[#22292f]"
                : "text-[#516778] hover:text-[#22292f]"
                }`}
            >
              {detailTab === tab && (
                <motion.div
                  layoutId="eventDetailTabIndicator"
                  className="absolute inset-0 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Top Right Action Button */}
        <button className="w-8 h-8 bg-[#22292f] rounded-lg flex items-center justify-center hover:bg-[#3a4249] transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tab Content */}
      {detailTab === "overview" && (
        <div className="flex lg:flex-row flex-col gap-4 items-start">
          {/* Left: Event Preview Card */}
          <div className="w-full lg:w-[417px] shrink-0 bg-white border border-[#b0bfc9] rounded-lg p-3">
            <div className="flex flex-col gap-4">
              {/* Cover Image Upload Area */}
              <div
                className="relative w-full h-[150px] rounded-lg overflow-hidden bg-[#d5dde2] group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImage?.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImage}
                    alt="Event cover"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-80 absolute inset-0"
                  />
                ) : (
                  <Image
                    key={coverImage}
                    src={coverImage}
                    alt="Event cover"
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                  />
                )}
                {/* Overlay with Larger Camera Icon (Matching Figma/User Photo) */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-[46px] h-[46px] bg-[#3f52ff] border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Event Info Prevew */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#22292f] leading-[18px]">
                    {eventTitle}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 h-5 px-2 bg-[#112755] text-white text-[10px] font-medium rounded-[4px] leading-none">
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                      </svg>
                      {chapter}
                    </span>
                    <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-medium rounded-[4px] leading-none">
                      {type}
                    </span>
                  </div>
                </div>

                {/* Date + Location Preview */}
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {/* Date Widget */}
                  <div className="flex items-center gap-2">
                    <div className="w-[40px] h-[42px] border border-[#859bab] rounded-[8px] flex flex-col items-center overflow-hidden bg-white shrink-0">
                      <div className="bg-[#859bab] w-full h-[14px] flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-bold leading-none uppercase tracking-tight">{displayMonth}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[16px] font-medium text-[#859bab] leading-none">{displayDay}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-[#22292f] leading-none">{startDate?.toString()}</span>
                      <span className="text-sm font-normal text-[#859bab] leading-[21px] mt-1">{startTime} - {endTime} UTC+4</span>
                    </div>
                  </div>

                  {/* Location Icon Block */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border border-[#859bab] rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#859bab]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-[#22292f] leading-[24px]">Location Preview</span>
                      <span className="text-sm font-normal text-[#859bab] leading-[21px] truncate w-[150px]">
                        {locationInput || "Add location below"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Rows: Map Pin + Signups */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f2f4]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#516778] shrink-0" />
                    <span className="text-sm font-normal text-[#22292f] leading-[18px] truncate">
                      {locationInput || "Not specificed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardPenLine className="w-4 h-4 text-[#516778] shrink-0" />
                    <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                      {event?.signups || 0}/{event?.maxSignups || 300}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Event Form */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="flex justify-end">
              <div className="w-[120px]">
                <AriaSelect aria-label="Language" defaultSelectedKey="English">
                  <AriaSelectItem id="English" textValue="English">English</AriaSelectItem>
                  <AriaSelectItem id="French" textValue="French">French</AriaSelectItem>
                  <AriaSelectItem id="Arabic" textValue="Arabic">Arabic</AriaSelectItem>
                </AriaSelect>
              </div>
            </div>

            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="text-[40px] font-bold text-[#3f52ff] leading-[46px] bg-transparent outline-none w-full"
              placeholder="Event Title"
            />

            {/* Start / End Date-Time Input */}
            <div className="flex sm:flex-row flex-col gap-2 items-start">
              <div className="flex-1 bg-white rounded-lg p-2.5 flex flex-col gap-4 w-full">
                {/* Start Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[42px] border border-[#859bab] rounded-[8px] flex flex-col items-center overflow-hidden bg-white shrink-0">
                      <div className="bg-[#859bab] w-full h-[14px] flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-bold leading-none uppercase tracking-tight">{displayMonth}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[16px] font-medium text-[#859bab] leading-none">{displayDay}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#22292f]">Start</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-[136px]">
                      <AriaDatePicker value={startDate} onChange={setStartDate} />
                    </div>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#d8e6ff] rounded-lg px-2 py-2 text-base font-normal text-[#22292f] w-[60px] text-center outline-none"
                    />
                  </div>
                </div>

                {/* Divider / Line between */}
                <div className="ml-5 h-px bg-[#f0f2f4] -my-2" />

                {/* End Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[42px] border border-[#859bab] rounded-[8px] flex flex-col items-center overflow-hidden bg-white shrink-0 opacity-60">
                      <div className="bg-[#859bab] w-full h-[14px] flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-bold leading-none uppercase tracking-tight">
                          {getDayAndMonth(endDate).month}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[16px] font-medium text-[#859bab] leading-none">
                          {getDayAndMonth(endDate).day}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#22292f]">End</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-[136px]">
                      <AriaDatePicker value={endDate} onChange={setEndDate} />
                    </div>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-[#d8e6ff] rounded-lg px-2 py-2 text-base font-normal text-[#22292f] w-[60px] text-center outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0">
                <Globe className="w-4 h-4 text-[#22292f]" />
                <span className="text-sm font-medium text-[#22292f]">GMT+01:00</span>
                <span className="text-xs font-normal text-[#668091]">Algiers</span>
              </div>
            </div>

            <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22292f]" />
                <span className="text-base font-medium text-[#22292f]">Duration</span>
              </div>
              <span className="text-base font-medium text-[#668091]">3 hours</span>
            </div>

            {/* Chapter / Type Selection */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <AriaSelect
                  label="Chapter"
                  selectedKey={chapter}
                  onSelectionChange={(k) => setChapter(k as string)}
                >
                  <AriaSelectItem id="Dubai Chapter" textValue="Dubai Chapter">Dubai Chapter</AriaSelectItem>
                  <AriaSelectItem id="London Chapter" textValue="London Chapter">London Chapter</AriaSelectItem>
                  <AriaSelectItem id="Paris Chapter" textValue="Paris Chapter">Paris Chapter</AriaSelectItem>
                </AriaSelect>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <AriaSelect
                  label="Event Type"
                  selectedKey={type}
                  onSelectionChange={(k) => setType(k as "Onsite" | "Online" | "Hybrid")}
                >
                  <AriaSelectItem id="Onsite" textValue="Onsite">Onsite</AriaSelectItem>
                  <AriaSelectItem id="Online" textValue="Online">Online</AriaSelectItem>
                  <AriaSelectItem id="Hybrid" textValue="Hybrid">Hybrid</AriaSelectItem>
                </AriaSelect>
              </div>
            </div>

            {/* Event Location Section */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#3f52ff]">Event Location</span>
              <div className="bg-white rounded-lg p-3 flex flex-col gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#22292f] mt-0.5" />
                  <span className="text-base font-medium text-[#22292f]">Add event location</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#22292f]">Location Name</label>
                  <input
                    type="text"
                    placeholder="Enter the location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="h-9 px-3 border border-[#d5dde2] rounded-lg text-sm text-[#22292f] outline-none focus:border-[#3f52ff]"
                  />
                </div>
                <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-[#eee]">
                  <Image src="/img/map-placeholder.jpg" alt="Map" fill className="object-cover" />
                </div>

                {/* Geo-Fence Radius */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f2f4]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#22292f]">Geo-Fence Radius</span>
                    <span className="text-sm font-medium text-[#668091]">{geoFenceRadius} meters</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    value={geoFenceRadius}
                    onChange={(e) => setGeoFenceRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#eceff2] rounded-full appearance-none accent-[#3f52ff] cursor-pointer"
                  />
                </div>

                {/* Location Masking */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f4]">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#22292f]">Location Masking</span>
                    <span className="text-xs text-[#859bab]">Hide real location and show custom name</span>
                  </div>
                  <button
                    onClick={() => setLocationMasking(!locationMasking)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${locationMasking ? "bg-[#3f52ff]" : "bg-[#d5dde2]"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${locationMasking ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#3f52ff]">Description</span>
              <div className="border border-[#b0bfc9] rounded-lg p-3 flex flex-col gap-2 h-[149px] bg-white">
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  maxLength={280}
                  className="flex-1 text-sm font-normal text-[#22292f] resize-none outline-none"
                />
                <div className="flex justify-end">
                  <span className="text-[#859bab] text-[10px] font-semibold">
                    {eventDescription.length}/280
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const savedEvent: EventItem = {
                  id: event?.id || crypto.randomUUID(),
                  title: eventTitle,
                  coverImage,
                  chapter,
                  type: type,
                  eventCategory: event?.eventCategory || "general",
                  location: locationInput,
                  signups: event?.signups || 0,
                  maxSignups: event?.maxSignups || 300,
                  dateGroup: startDate?.toString() || "", // Using start date as date group for now
                  date: startDate?.toString(),
                };
                onSave(savedEvent);
              }}
              className="w-full min-h-[40px] bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors mt-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Guests Tab Content */}
      {detailTab === "guests" && (
        <div className="flex flex-col gap-4">
          {/* Stats Row */}
          <div className="flex items-stretch border border-[#d5dde2] rounded-lg bg-white">
            {/* Registered Guests */}
            <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
              <div className="flex items-center gap-2">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#516778]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Registered Guests</span>
                  <span className="text-xs font-normal text-[#516778] leading-[18px]">Capacity limit</span>
                </div>
              </div>
              <span className="text-base font-semibold text-[#22292f] leading-[18px]">42 / 50</span>
            </div>
            {/* Checked In */}
            <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
              <div className="flex items-center gap-2">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10.667 2H13.333C13.687 2 14 2.313 14 2.667V13.333C14 13.687 13.687 14 13.333 14H10.667" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.667 11.333L10 8L6.667 4.667M2 8H10" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Checked In</span>
                  <span className="text-xs font-normal text-[#516778] leading-[18px]">0% of registered</span>
                </div>
              </div>
              <span className="text-base font-semibold text-[#22292f] leading-[18px]">0</span>
            </div>
            {/* Checked Out */}
            <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
              <div className="flex items-center gap-2">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10.667 2H13.333C13.687 2 14 2.313 14 2.667V13.333C14 13.687 13.687 14 13.333 14H10.667" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11.333L13.333 8L10 4.667M2 8H13.333" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Checked Out</span>
                  <span className="text-xs font-normal text-[#516778] leading-[18px]">0% of checked in</span>
                </div>
              </div>
              <span className="text-base font-semibold text-[#22292f] leading-[18px]">0</span>
            </div>
            {/* Booked */}
            <div className="flex-1 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#516778" strokeWidth="1.33" /><path d="M8 5V8L10 10" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Booked</span>
                  <span className="text-xs font-normal text-[#516778] leading-[18px]">Checked-in</span>
                </div>
              </div>
              <span className="text-base font-semibold text-[#22292f] leading-[18px]">0</span>
            </div>
          </div>

          {/* Guest List Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-[#22292f]">Guest List</h3>
              <span className="text-sm text-[#859bab]">All registered guests for this event</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 h-8 px-3 bg-[#22292f] text-white text-xs font-medium rounded-lg hover:bg-[#3a4249] transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.66699 5.83301L7.00033 8.16634L9.33366 5.83301" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 8.16634V1.74967" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Export CSV
                <span className="bg-white/20 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">2</span>
              </button>
              <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
                Add User
              </button>
            </div>
          </div>

          {/* Search + Filter Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg flex-1 max-w-[320px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7.333" cy="7.333" r="4.667" stroke="#668091" strokeWidth="1.33" /><path d="M14 14L10.667 10.667" stroke="#668091" strokeWidth="1.33" strokeLinecap="round" /></svg>
              <input
                type="text"
                placeholder="Search Name, Email"
                value={guestSearchQuery}
                onChange={(e) => setGuestSearchQuery(e.target.value)}
                className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] outline-none bg-transparent"
              />
              <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded">⌘K</span>
            </div>
            <AriaSelect
              selectedKey={guestStatusFilter}
              onSelectionChange={(key) => setGuestStatusFilter(key as string)}
              className="w-[160px]"
            >
              <AriaSelectItem id="all" textValue="All Guests">All Guests</AriaSelectItem>
              <AriaSelectItem id="checked-in" textValue="Checked In">Checked In</AriaSelectItem>
              <AriaSelectItem id="not-checked-in" textValue="Not Checked In">Not Checked In</AriaSelectItem>
              <AriaSelectItem id="booked" textValue="Booked">Booked</AriaSelectItem>
              <AriaSelectItem id="cancelled" textValue="Cancelled">Cancelled</AriaSelectItem>
            </AriaSelect>
          </div>

          {/* Guest Table */}
          <div className="bg-white border border-[#d5dde2] rounded-xl overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[40px]" />
                  <col className="w-[16%]" />
                  <col className="w-[20%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead>
                  <tr className="[&>th]:bg-[#eceff2] [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                    {/* Checkbox */}
                    <th className="h-9 px-4 py-2 text-left">
                      <AriaCheckbox
                        isSelected={selectedGuests.size === guests.length && guests.length > 0}
                        isIndeterminate={selectedGuests.size > 0 && selectedGuests.size < guests.length}
                        onChange={(isSelected) => {
                          if (isSelected) {
                            setSelectedGuests(new Set(guests.map(g => g.id)));
                          } else {
                            setSelectedGuests(new Set());
                          }
                        }}
                      />
                    </th>
                    {/* Headers */}
                    {[
                      { label: "Name", key: "name" },
                      { label: "Email", key: "email" },
                      { label: "Registration Time", key: "registrationTime" },
                      { label: "Ticket ID", key: "ticketId" },
                      { label: "Ticket QR", key: "ticketQr" },
                      { label: "Status", key: "status" }
                    ].map((header) => (
                      <th
                        key={header.key}
                        className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]"
                      >
                        <div className="flex items-center gap-1">
                          {header.label}
                          {header.key !== "ticketQr" && header.key !== "status" && (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guests
                    .filter(g => {
                      if (guestStatusFilter !== "all" && g.status !== guestStatusFilter) return false;
                      if (guestSearchQuery && !g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) && !g.email.toLowerCase().includes(guestSearchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .slice((guestPage - 1) * guestsPerPage, guestPage * guestsPerPage)
                    .map((guest) => (
                      <tr
                        key={guest.id}
                        className="border-b border-[#eceff2] last:border-b-0 hover:bg-[#f9fafb] transition-colors"
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <AriaCheckbox
                            isSelected={selectedGuests.has(guest.id)}
                            onChange={(isSelected) => {
                              const newSet = new Set(selectedGuests);
                              if (isSelected) {
                                newSet.add(guest.id);
                              } else {
                                newSet.delete(guest.id);
                              }
                              setSelectedGuests(newSet);
                            }}
                          />
                        </td>
                        {/* Name */}
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-[#22292f] block truncate">{guest.name}</span>
                        </td>
                        {/* Email */}
                        <td className="px-3 py-3">
                          <span className="text-sm text-[#516778] block truncate">{guest.email}</span>
                        </td>
                        {/* Registration Time */}
                        <td className="px-3 py-3">
                          <span className="text-sm text-[#516778] block truncate">{guest.registrationTime}</span>
                        </td>
                        {/* Ticket ID */}
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-[#22292f] block truncate">{guest.ticketId}</span>
                        </td>
                        {/* Ticket QR */}
                        <td className="px-3 py-3">
                          <button className="flex items-center gap-1 h-7 px-2 bg-white border border-[#d5dde2] rounded text-xs font-medium text-[#516778] hover:bg-[#f9fafb] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="#516778" strokeWidth="1" /><rect x="3" y="3" width="2" height="2" fill="#516778" /><rect x="7" y="3" width="2" height="2" fill="#516778" /><rect x="3" y="7" width="2" height="2" fill="#516778" /><rect x="7" y="7" width="2" height="2" fill="#516778" /></svg>
                            View QR
                          </button>
                        </td>
                        {/* Status */}
                        <td className="px-3 py-3">
                          {guest.status === "checked-in" && (
                            <span className="inline-flex items-center gap-1 h-6 px-2 bg-[#e8f8ea] text-[#22892e] text-xs font-medium rounded-full">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#22892e" /><path d="M4 6L5.5 7.5L8 4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              Checked-In
                            </span>
                          )}
                          {guest.status === "not-checked-in" && (
                            <span className="inline-flex items-center gap-1 h-6 px-2 bg-[#fff4e5] text-[#d97706] text-xs font-medium rounded-full">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 10H1L6 1Z" fill="#d97706" /><path d="M6 4.5V6.5M6 8V8.01" stroke="white" strokeWidth="1" strokeLinecap="round" /></svg>
                              Not Checked-In
                            </span>
                          )}
                          {guest.status === "booked" && (
                            <span className="inline-flex items-center gap-1 h-6 px-2 bg-[#e8f8ea] text-[#22892e] text-xs font-medium rounded-full">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#22892e" /><path d="M4 6L5.5 7.5L8 4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              Booked
                            </span>
                          )}
                          {guest.status === "cancelled" && (
                            <span className="inline-flex items-center gap-1 h-6 px-2 bg-[#fee2e2] text-[#dc2626] text-xs font-medium rounded-full">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#dc2626" /><path d="M4 4L8 8M8 4L4 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setGuestPage(p => Math.max(1, p - 1))}
              disabled={guestPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#d5dde2] rounded-lg bg-white text-[#516778] hover:bg-[#f9fafb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="text-sm text-[#516778]">
              Page <span className="font-semibold text-[#22292f]">{guestPage}</span> of <span className="font-semibold text-[#22292f]">{Math.ceil(guests.filter(g => (guestStatusFilter === "all" || g.status === guestStatusFilter) && (!guestSearchQuery || g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) || g.email.toLowerCase().includes(guestSearchQuery.toLowerCase()))).length / guestsPerPage) || 1}</span>
            </span>
            <button
              onClick={() => setGuestPage(p => p + 1)}
              disabled={guestPage >= Math.ceil(guests.filter(g => (guestStatusFilter === "all" || g.status === guestStatusFilter) && (!guestSearchQuery || g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) || g.email.toLowerCase().includes(guestSearchQuery.toLowerCase()))).length / guestsPerPage)}
              className="w-8 h-8 flex items-center justify-center border border-[#d5dde2] rounded-lg bg-white text-[#516778] hover:bg-[#f9fafb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Event Card Component ---
function EventCard({ event, onClick }: { event: EventItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#b0bfc9] rounded-lg p-3 flex flex-col flex-1 min-w-0 cursor-pointer hover:border-[#3f52ff] transition-all group"
    >
      <div className="flex flex-col gap-4">
        {/* Cover Image */}
        <div className="relative w-full h-[150px] rounded-lg overflow-hidden bg-[#d9d9d9]">
          {event.coverImage?.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          )}
          {/* 3-dot menu */}
          <button className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#d8e6ff] rounded-full flex items-center justify-center hover:bg-[#c5d8f7] transition-colors">
            <MoreVertical className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Title + Badges */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#22292f] leading-[18px]">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 h-5 px-2 bg-[#112755] text-white text-[10px] font-medium rounded-[4px] leading-none">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                </svg>
                {event.chapter}
              </span>
              <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-medium rounded-[4px] leading-none">
                {event.type}
              </span>
              {event.date && (
                <span className="text-sm font-normal text-[#516778] leading-[18px]">
                  {event.date}
                </span>
              )}
            </div>
          </div>

          {/* Location + Signups */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#516778] shrink-0" />
              <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardPenLine className="w-4 h-4 text-[#516778] shrink-0" />
              <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                {event.signups}/{event.maxSignups}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsPageContent({ currentUser }: EventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [activeTab, setActiveTab] = useState<"all" | "current" | "past">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | "general" | "match">("all");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<DateValue | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Filter Logic
  const filteredEvents = events.filter((e) => {
    // 1. Tab Filter
    // (Existing tab logic assumes "current" vs "past" based on date but mock data is hardcoded)
    // We'll keep tab logic placeholders or simple if activeTab is used elsewhere.

    // 2. Category Filter
    if (filterCategory !== "all" && e.eventCategory !== filterCategory) return false;

    // 3. Chapter Filter
    if (filterChapter !== "all") {
      // Match by chapter name
      if (e.chapter !== filterChapter) return false;
    }

    // 4. Type Filter
    if (filterType !== "all" && e.type.toLowerCase() !== filterType.toLowerCase()) return false;

    // 5. Date Filter
    if (filterDate) {
      if (e.dateIso !== filterDate.toString()) return false;
    }

    return true;
  });

  const hasEvents = events.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;

  // Group events by dateGroup
  const groupedEvents: Record<string, EventItem[]> = {};
  filteredEvents.forEach((ev) => {
    if (!groupedEvents[ev.dateGroup]) {
      groupedEvents[ev.dateGroup] = [];
    }
    groupedEvents[ev.dateGroup].push(ev);
  });
  useEffect(() => {
    const editId = searchParams.get("edit");
    const create = searchParams.get("create");

    if (editId) {
      const event = events.find((e) => e.id === editId);
      if (event) {
        setSelectedEvent(event);
        setShowCreateEvent(true);
      } else {
        setSelectedEvent(null);
        setShowCreateEvent(false);
      }
    } else if (create === "true") {
      setSelectedEvent(null);
      setShowCreateEvent(true);
    } else {
      setSelectedEvent(null);
      setShowCreateEvent(false);
    }
  }, [searchParams, events]);

  const handleSaveEvent = (savedEvent: EventItem) => {
    if (selectedEvent) {
      // Update existing
      setEvents((prev) => prev.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
    } else {
      // Create new
      setEvents((prev) => [savedEvent, ...prev]);
    }
    toastQueue.add({
      title: selectedEvent ? "Event Updated" : "Event Created",
      description: `"${savedEvent.title}" has been successfully saved.`,
      variant: "success",
    }, { timeout: 3000 });
    handleClose();
  };

  const handleCreateEvent = () => {
    router.push(`${pathname}?create=true`);
  };

  const handleEditEvent = (event: EventItem) => {
    router.push(`${pathname}?edit=${event.id}`);
  };

  const handleClose = () => {
    router.push(pathname);
  };

  // Compute stats from events
  const totalEvents = events.length;
  const matchCount = events.filter((e) => e.eventCategory === "match").length;
  const generalCount = events.filter((e) => e.eventCategory === "general").length;
  const matchPercent = totalEvents > 0 ? ((matchCount / totalEvents) * 100).toFixed(1) : "0";
  const generalPercent = totalEvents > 0 ? ((generalCount / totalEvents) * 100).toFixed(1) : "0";


  return (
    <div className="flex min-h-screen bg-[#f9fafb] font-[family-name:'Instrument_Sans',sans-serif]">
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-[#eceff2]">
          <nav className="flex items-center gap-0.5 text-sm">
            <span className="text-[#859bab] font-medium px-1 py-0.5">
              <Calendar className="w-4 h-4 inline mr-1" />
            </span>
            <span className="text-[#859bab] font-medium px-1 py-0.5">Event</span>
          </nav>
          <div className="bg-[#d5dde2] rounded-full p-[7px]">
            <Bell className="w-[17px] h-[17px] text-[#22292f]" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {showCreateEvent || selectedEvent ? (
            <CreateEventView
              event={selectedEvent}
              onClose={handleClose}
              onSave={handleSaveEvent}
            />
          ) : (
            <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg p-2 pb-2 flex flex-col gap-4">
              {/* Page Header */}
              <div className="flex flex-col gap-2 pl-4 pt-2">
                <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
                  Events Management
                </h1>
                <p className="text-base font-semibold text-[#859bab] leading-[18px]">
                  This section enables you to manage your app members and Teams
                </p>
              </div>

              {/* Stats Cards */}
              <div className="flex items-stretch border border-[#d5dde2] rounded-lg bg-white">
                {/* Total Events */}
                <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2] rounded-l-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#516778]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">
                        Total Events
                      </span>
                      <span className="text-xs font-normal text-[#516778] leading-[18px]">
                        All Events
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-semibold text-[#22292f] leading-[18px]">
                    {totalEvents}
                  </span>
                </div>

                {/* Match */}
                <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <ClipboardPenLine className="w-4 h-4 text-[#516778]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">
                        Match
                      </span>
                      <span className="text-xs font-normal text-[#516778] leading-[18px]">
                        {matchPercent}% of total
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-semibold text-[#22292f] leading-[18px]">
                    {matchCount}
                  </span>
                </div>

                {/* General Event */}
                <div className="flex-1 flex items-center justify-between p-4 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#516778]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">
                        General Event
                      </span>
                      <span className="text-xs font-normal text-[#516778] leading-[18px]">
                        {generalPercent}% of total
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-semibold text-[#22292f] leading-[18px]">
                    {generalCount}
                  </span>
                </div>
              </div>

              {/* Tabs + Filters Bar */}
              <div className="flex items-center justify-between">
                {/* Left: Event tabs */}
                <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
                  {(["all", "current", "past"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeTab === tab
                        ? "text-[#3f52ff]"
                        : "text-[#516778] hover:text-[#22292f]"
                        }`}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="eventsTabIndicator"
                          className="absolute inset-0 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === "all" ? "All events" : tab === "current" ? "Current Event" : "Past Events"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right: Filter dropdowns + Create Event */}
                {hasEvents && (
                  <div className="flex items-center gap-2">
                    {/* Select Date */}
                    <div className="w-[160px]">
                      <AriaDatePicker value={filterDate} onChange={setFilterDate} aria-label="Select Date" />
                    </div>


                    {/* General Event dropdown - mapped to filterCategory */}
                    <div className="w-[150px]">
                      <AriaSelect
                        aria-label="Filter Category"
                        selectedKey={filterCategory}
                        onSelectionChange={(k) => setFilterCategory(k as any)}
                      >
                        <AriaSelectItem id="all" textValue="All Events">All Events</AriaSelectItem>
                        <AriaSelectItem id="general" textValue="General Event">General Event</AriaSelectItem>
                        <AriaSelectItem id="match" textValue="Match">Match</AriaSelectItem>
                      </AriaSelect>
                    </div>

                    {/* All Chapters dropdown */}
                    <div className="w-[150px]">
                      <AriaSelect
                        aria-label="Filter Chapter"
                        selectedKey={filterChapter}
                        onSelectionChange={(k) => setFilterChapter(k as string)}
                      >
                        <AriaSelectItem id="all" textValue="All Chapters">All Chapters</AriaSelectItem>
                        {DEFAULT_CHAPTERS.map(c => (
                          <AriaSelectItem key={c.code} id={c.name} textValue={c.name}>{c.name}</AriaSelectItem>
                        ))}
                      </AriaSelect>
                    </div>

                    {/* All types dropdown */}
                    <div className="w-[140px]">
                      <AriaSelect
                        aria-label="Filter Type"
                        selectedKey={filterType}
                        onSelectionChange={(k) => setFilterType(k as string)}
                      >
                        <AriaSelectItem id="all" textValue="All types">All types</AriaSelectItem>
                        <AriaSelectItem id="onsite" textValue="Onsite">Onsite</AriaSelectItem>
                        <AriaSelectItem id="online" textValue="Online">Online</AriaSelectItem>
                        <AriaSelectItem id="hybrid" textValue="Hybrid">Hybrid</AriaSelectItem>
                      </AriaSelect>
                    </div>

                    {/* + Create Event */}
                    <button
                      onClick={handleCreateEvent}
                      className="flex items-center gap-1 h-9 px-4 bg-[#3f52ff] text-white text-xs font-normal rounded-lg hover:bg-[#3545e0] transition-colors"
                    >
                      + Create Event
                    </button>
                  </div>
                )}
              </div>

              {/* Events Content: Empty State or Events List */}
              {hasEvents ? (
                hasFilteredEvents ? (
                  <div className="flex flex-col gap-4">
                    {Object.entries(groupedEvents).map(([dateGroup, events]) => (
                      <div key={dateGroup} className="flex flex-col gap-4">
                        {/* Date Group Header */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-[#516778] leading-[18px] whitespace-nowrap">
                            {dateGroup}
                          </span>
                          <div className="flex-1 h-px bg-[#d5dde2]" />
                        </div>

                        {/* Events Grid - 2 columns */}
                        <div className="grid grid-cols-2 gap-4">
                          {events.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onClick={() => handleEditEvent(event)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No Results State (Filter Active) */
                  <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-[#d5dde2] rounded-xl">
                    <Image
                      src="/img/events-empty.svg"
                      alt="No events found"
                      width={165}
                      height={160}
                      className="object-contain"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="text-lg font-semibold text-[#22292f]">No events found</h3>
                      <p className="text-sm text-[#859bab] text-center max-w-xs">
                        No events scheduled for the selected filters. <br /> Try adjusting your dates or categories.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFilterDate(null);
                        setFilterCategory("all");
                        setFilterChapter("all");
                        setFilterType("all");
                      }}
                      className="text-sm font-medium text-[#3f52ff] hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function EventsPageClient(props: EventsPageClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPageContent {...props} />
    </Suspense>
  );
}
