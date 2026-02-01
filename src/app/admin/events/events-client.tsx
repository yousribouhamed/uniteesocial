"use client";

import Image from "next/image";
import { useState } from "react";
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
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

// --- Types ---
interface EventItem {
  id: string;
  title: string;
  coverImage: string;
  chapter: string;
  type: "Onsite" | "Online" | "Hybrid";
  eventCategory: "general" | "match";
  date?: string;
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
    signups: 65,
    maxSignups: 300,
    dateGroup: "24 Oct. Saturday",
  },
];

// --- Create Event View ---
function CreateEventView({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState<"overview" | "guests" | "analytics" | "advanced">("overview");
  const [eventTitle, setEventTitle] = useState(event?.title || "New Event");
  const [chapter, setChapter] = useState(event?.chapter || "Dubai Chapter");
  const [type, setType] = useState(event?.type || "Onsite");
  const [startDate, setStartDate] = useState(event?.dateGroup || "lun. 24 nov.");
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState("lun. 24 nov.");
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

  // Helper to parse day and month from startDate string for the widget
  const getDayAndMonth = (dateStr: string) => {
    const day = dateStr.match(/\d+/)?.[0] || "25";
    const monthPatterns: { [key: string]: string } = {
      jan: "JAN.", feb: "FEB.", mar: "MAR.", apr: "APR.", may: "MAY.", jun: "JUN.",
      jul: "JUL.", aug: "AUG.", sep: "SEP.", oct: "OCT.", nov: "NOV.", dec: "DEC.",
      janv: "JAN.", févr: "FEB.", mars: "MAR.", avr: "APR.", mai: "MAY.", juin: "JUN.",
      juil: "JUL.", août: "AUG.", sept: "SEP.", octo: "OCT.", nove: "NOV.", déc: "DEC."
    };

    // Split to find the first month-like word
    const words = dateStr.toLowerCase().split(/[^a-zÀ-ÿ0-9]/);
    let month = "OCT.";
    for (const word of words) {
      if (word.length < 2) continue;
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
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg p-2 pb-2 flex flex-col gap-4">
      {/* Header: Title + Badges + Check-In Guests */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#22292f] leading-[18px]">
            {eventTitle}
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-normal rounded leading-[12px]">
              {chapter}
            </span>
            <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-normal rounded leading-[12px]">
              {type}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
          Check-In Guests
        </button>
      </div>

      {/* Detail Tabs: Overview, Guests, Analytics, Advanced */}
      <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
        {(["overview", "guests", "analytics", "advanced"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDetailTab(tab)}
            className={`relative h-9 px-3 py-2 rounded-lg text-base font-medium transition-colors z-10 ${detailTab === tab
              ? "text-[#3f52ff]"
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

      {/* Two-Column Layout */}
      <div className="flex gap-4 items-start">
        {/* Left: Event Preview Card */}
        <div className="w-[417px] shrink-0 bg-white border border-[#b0bfc9] rounded-lg p-3">
          <div className="flex flex-col gap-4">
            {/* Cover Image */}
            <div className="relative w-full h-[150px] rounded-lg overflow-hidden bg-[#d5dde2]">
              <Image
                src={event?.coverImage || "/img/event-cover-placeholder.jpg"}
                alt="Event cover"
                fill
                className="object-cover"
              />
              {/* Camera upload button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-[#3f52ff] border-2 border-white rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Event Info */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-[#22292f] leading-[18px]">
                  {eventTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-normal rounded leading-[12px]">
                    Dubai Chapter
                  </span>
                  <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] text-white text-[10px] font-normal rounded leading-[12px]">
                    Onsite
                  </span>
                </div>
              </div>

              {/* Date + Location Link */}
              <div className="flex flex-wrap gap-8">
                {/* Date Widget */}
                <div className="flex items-center gap-2">
                  <div className="w-[38px] h-[40px] border border-[#859bab] rounded-lg flex flex-col items-center overflow-hidden bg-white shrink-0">
                    <div className="bg-[#859bab] w-full h-[18px] flex items-center justify-center">
                      <span className="text-[10px] text-white/80 font-bold leading-none tracking-tight">{displayMonth}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full">
                      <span className="text-[16px] font-medium text-[#859bab] leading-none mb-0.5">{displayDay}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-[#22292f] leading-[24px]">{startDate}</span>
                    <span className="text-sm font-normal text-[#859bab] leading-[21px]">{startTime} - {endTime} UTC+4</span>
                  </div>
                </div>

                {/* Location Link */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 border border-[#859bab] rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#859bab]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-[#22292f] leading-[24px]">Alura</span>
                    <span className="text-sm font-normal text-[#859bab] leading-[21px]">Dubai, Dubai</span>
                  </div>
                </div>
              </div>

              {/* Map Pin + Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#516778] shrink-0" />
                <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                  {locationInput || "Location not set"}
                </span>
              </div>

              {/* Signups */}
              <div className="flex items-center gap-2">
                <ClipboardPenLine className="w-4 h-4 text-[#516778] shrink-0" />
                <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                  {event?.signups || 0}/{event?.maxSignups || 300}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Event Form */}
        <div className="flex-1 flex flex-col gap-4 py-3">
          {/* Language Dropdown */}
          <div className="flex justify-end">
            <button className="flex items-center gap-1 h-8 px-3 bg-[#edf8ff] text-[#1d2cb6] text-xs font-medium rounded-lg hover:bg-[#dbeefe] transition-colors">
              English
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Large Title */}
          <h2 className="text-[40px] font-bold text-[#3f52ff] leading-[46px]">
            {eventTitle}
          </h2>

          {/* Start / End Date-Time */}
          <div className="flex gap-2 items-start">
            <div className="flex-1 bg-white rounded-lg p-1 flex flex-col gap-1">
              {/* Start Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3f52ff]" />
                  <span className="text-sm font-normal text-[#22292f] leading-[24px]">Start</span>
                </div>
                <div className="flex gap-0.5">
                  <div className="bg-[#d8e6ff] rounded-l-lg px-3 py-2 w-[136px]">
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-base font-normal text-[#22292f] w-full outline-none"
                    />
                  </div>
                  <div className="bg-[#d8e6ff] rounded-r-lg px-1 py-2">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-transparent text-base font-normal text-[#22292f] w-[50px] text-center outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* End Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#3f52ff]" />
                  <span className="text-sm font-normal text-[#22292f] leading-[24px]">End</span>
                </div>
                <div className="flex gap-0.5">
                  <div className="bg-[#d8e6ff] rounded-l-lg px-3 py-2 w-[136px]">
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-base font-normal text-[#22292f] w-full outline-none"
                    />
                  </div>
                  <div className="bg-[#d8e6ff] rounded-r-lg px-1 py-2">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-transparent text-base font-normal text-[#22292f] w-[50px] text-center outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Dashed line between start/end dots */}
            </div>

            {/* Timezone */}
            <div className="bg-white rounded-lg w-[140px] h-full p-2 flex flex-col gap-1">
              <Globe className="w-4 h-4 text-[#22292f]" />
              <span className="text-sm font-medium text-[#22292f] leading-[18px]">GMT+01:00</span>
              <span className="text-xs font-normal text-[#668091] leading-[21px]">Algiers</span>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#22292f]" />
              <span className="text-base font-medium text-[#22292f] leading-[16px]">Duration</span>
            </div>
            <span className="text-base font-medium text-[#668091] leading-[24px]">3 hours</span>
          </div>

          {/* Event Location Section */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#3f52ff] leading-[21px]">Event Location</span>

            <div className="bg-white rounded-lg p-3 flex flex-col gap-6">
              {/* Add event location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#22292f] mt-0.5 shrink-0" />
                <span className="text-base font-medium text-[#22292f] leading-[16px]">Add event location</span>
              </div>

              {/* Location Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#22292f]">Label</label>
                <input
                  type="text"
                  placeholder="Enter the location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="h-9 px-3 py-1 border border-[#d5dde2] rounded-lg text-sm text-[#22292f] placeholder:text-[#668091] outline-none focus:border-[#3f52ff] transition-colors"
                />
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#859bab]" />
                  <span className="text-sm font-normal text-[#859bab]">Type to search (Google Typeahead Search integration)</span>
                </div>
              </div>

              {/* Map */}
              <div className="relative w-full h-[120px] rounded-xl overflow-hidden">
                <Image
                  src="/img/map-placeholder.jpg"
                  alt="Map"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Geo-Fence Radius */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-[#22292f] leading-[16px]">Geo-Fence Radius</span>
                  <span className="text-base font-medium text-[#668091] leading-[24px]">{geoFenceRadius} meters</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={geoFenceRadius}
                  onChange={(e) => setGeoFenceRadius(Number(e.target.value))}
                  className="w-full h-2 bg-[#ececf0] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#3f52ff] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #3f52ff ${(geoFenceRadius / 1000) * 100}%, #ececf0 ${(geoFenceRadius / 1000) * 100}%)`,
                  }}
                />
                <span className="text-xs font-semibold text-[#859bab] text-center">
                  Define the radius for location-based check-in verification
                </span>
              </div>

              {/* Location Masking */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-[#22292f]">Location Masking</span>
                    <span className="text-xs font-semibold text-[#859bab]">Hide real location and show custom name</span>
                  </div>
                  <button
                    onClick={() => setLocationMasking(!locationMasking)}
                    className={`w-8 h-[18px] rounded-full p-0.5 transition-colors ${locationMasking ? "bg-[#3f52ff]" : "bg-[#394753]"}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${locationMasking ? "translate-x-3.5" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Location Description Textarea */}
                <div className="border border-[#b0bfc9] rounded-lg p-3 flex flex-col gap-2 h-[149px]">
                  <textarea
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    maxLength={280}
                    className="flex-1 text-sm font-normal text-[#22292f] resize-none outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {locationDescription.length}/280 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#3f52ff] leading-[21px]">Event Description</span>
            <div className="border border-[#b0bfc9] rounded-lg p-3 flex flex-col gap-2 h-[149px] bg-white">
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                maxLength={280}
                className="flex-1 text-sm font-normal text-[#22292f] resize-none outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {eventDescription.length}/280 characters
                </span>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <button
            onClick={onClose}
            className="w-full h-10 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
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
              <span className="inline-flex items-center gap-1 h-[22px] px-2 bg-[#22292f] text-white text-xs font-normal rounded">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z" fill="white" />
                </svg>
                {event.chapter}
              </span>
              <span className="inline-flex items-center h-[22px] px-2 bg-[#22292f] text-white text-xs font-normal rounded">
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

export default function EventsPageClient({ currentUser }: EventsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "current" | "past">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | "general" | "match">("all");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Compute stats from events
  const totalEvents = mockEvents.length;
  const matchCount = mockEvents.filter((e) => e.eventCategory === "match").length;
  const generalCount = mockEvents.filter((e) => e.eventCategory === "general").length;
  const matchPercent = totalEvents > 0 ? ((matchCount / totalEvents) * 100).toFixed(1) : "0";
  const generalPercent = totalEvents > 0 ? ((generalCount / totalEvents) * 100).toFixed(1) : "0";

  const hasEvents = mockEvents.length > 0;

  // Filter events by category
  const filteredEvents = mockEvents.filter((e) => {
    if (filterCategory === "general") return e.eventCategory === "general";
    if (filterCategory === "match") return e.eventCategory === "match";
    return true;
  });

  // Group events by date
  const groupedEvents: Record<string, EventItem[]> = {};
  filteredEvents.forEach((event) => {
    if (!groupedEvents[event.dateGroup]) {
      groupedEvents[event.dateGroup] = [];
    }
    groupedEvents[event.dateGroup].push(event);
  });

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
              onClose={() => {
                setShowCreateEvent(false);
                setSelectedEvent(null);
              }}
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
                    <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg text-sm font-medium text-[#22292f] hover:bg-[#f9fafb] transition-colors">
                      <Calendar className="w-4 h-4 text-[#516778]" />
                      Select Date
                    </button>

                    {/* General Event dropdown */}
                    <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg text-sm font-medium text-[#22292f] hover:bg-[#f9fafb] transition-colors">
                      General Event
                      <ChevronDown className="w-4 h-4 text-[#516778]" />
                    </button>

                    {/* All Chapters dropdown */}
                    <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg text-sm font-medium text-[#22292f] hover:bg-[#f9fafb] transition-colors">
                      All Chapters
                      <ChevronDown className="w-4 h-4 text-[#516778]" />
                    </button>

                    {/* All types dropdown */}
                    <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg text-sm font-medium text-[#22292f] hover:bg-[#f9fafb] transition-colors">
                      All types
                      <ChevronDown className="w-4 h-4 text-[#516778]" />
                    </button>

                    {/* + Create Event */}
                    <button
                      onClick={() => setShowCreateEvent(true)}
                      className="flex items-center gap-1 h-9 px-4 bg-[#3f52ff] text-white text-xs font-normal rounded-lg hover:bg-[#3545e0] transition-colors"
                    >
                      + Create Event
                    </button>
                  </div>
                )}
              </div>

              {/* Events Content: Empty State or Events List */}
              {hasEvents ? (
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
                            onClick={() => setSelectedEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center gap-8 py-8">
                  <Image
                    src="/img/events-empty.svg"
                    alt="No events"
                    width={165}
                    height={160}
                    className="object-contain"
                  />
                  <div className="flex flex-col items-center gap-3 text-center">
                    <h2 className="text-2xl font-medium text-[#13151760] leading-[28.8px]">
                      No upcoming events
                    </h2>
                    <p className="text-base font-normal text-[#13151760] leading-6">
                      You have no upcoming events. Why not organize one?
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateEvent(true)}
                    className="flex items-center gap-1 h-9 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
