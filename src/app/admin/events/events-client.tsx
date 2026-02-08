"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Copy,
  Code,
  XCircle,
  AlertCircle,
  X,
  ArrowUp,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Eye,
  Trash2,
  TrendingUp,
  Search,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import AdminSidebar from "@/components/admin-sidebar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { AriaDatePicker } from "@/components/ui/aria-date-picker";
import { AriaCheckbox } from "@/components/ui/aria-checkbox";
import { AriaSlider } from "@/components/ui/aria-slider";
import { AriaSwitch } from "@/components/ui/aria-switch";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { today, getLocalTimeZone, DateValue, parseDate } from "@internationalized/date";
import { toastQueue } from "@/components/ui/aria-toast";
import { DEFAULT_CHAPTERS } from "@/data/chapters";
import { getEvents, createEvent, updateEvent, deleteEvent, EventData } from "./actions";
import { CreateEventScreen, EventFormData } from "./create-event-screen";
import { CloneEventModal } from "@/components/clone-event-modal";

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

const guestTableHeaders = [
  { label: "Name", key: "name", sortable: true },
  { label: "Email", key: "email", sortable: true },
  { label: "Registration Time", key: "registrationTime", sortable: true },
  { label: "Ticket ID", key: "ticketId", sortable: true },
  { label: "Ticket QR", key: "ticketQr", sortable: false },
  { label: "Status", key: "status", sortable: false },
];

// --- Create Event View ---
function CreateEventView({ event, onClose, onSave, isSaving = false }: { event: EventItem | null; onClose: () => void; onSave: (event: EventItem) => void; isSaving?: boolean }) {
  const [detailTab, setDetailTab] = useState<"overview" | "guests" | "analytics" | "advanced">("overview");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSlidoModal, setShowSlidoModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [eventTitle, setEventTitle] = useState(event?.title || "");
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
  const [coverImage, setCoverImage] = useState(event?.coverImage || "");

  // Guest tab state
  const [guests] = useState<GuestItem[]>(mockGuests);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [guestStatusFilter, setGuestStatusFilter] = useState<string>("all");
  const [eventTab, setEventTab] = useState<"general" | "match">("general");
  const [guestPage, setGuestPage] = useState(1);
  const guestsPerPage = 8;

  const filteredGuests = guests.filter((g) => {
    const matchesFilter = guestStatusFilter === "all" || g.status === guestStatusFilter;
    const query = guestSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      g.name.toLowerCase().includes(query) ||
      g.email.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const guestsToDisplay = filteredGuests.slice(
    (guestPage - 1) * guestsPerPage,
    guestPage * guestsPerPage
  );

  const totalGuestPages = Math.max(1, Math.ceil(filteredGuests.length / guestsPerPage));

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
        <div className="inline-flex items-center gap-1 bg-[#eceff2] p-1 rounded-lg w-fit self-start">
          {(["overview", "guests", "analytics", "advanced"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${detailTab === tab
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

        {/* Top Right Action Button */}
        <Menu>
          <MenuButton className="w-8 h-8 bg-[#22292f] rounded-lg flex items-center justify-center hover:bg-[#3a4249] transition-colors focus:outline-none data-[open]:bg-[#3a4249]">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </MenuButton>
          <Portal>
            <MenuItems
              anchor="bottom end"
              transition
              className="z-[100] mt-1.5 w-[180px] bg-white border border-[#d5dde2] rounded-xl p-1 shadow-lg focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <MenuItem>
                <button
                  onClick={() => setShowCloneModal(true)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-[#22292f] hover:bg-[#f0f2f5] transition-colors group focus:outline-none"
                >
                  <Copy className="w-4 h-4 text-[#516778]" />
                  Clone Event
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={() => setShowSlidoModal(true)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-[#d8e6ff] hover:bg-[#d8e6ff] transition-colors text-[#22292f] focus:outline-none"
                >
                  <Code className="w-4 h-4" />
                  Add Slido Embed
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-[#e53935] hover:bg-[#fff0f0] transition-colors group focus:outline-none"
                >
                  <XCircle className="w-4 h-4 text-[#e53935]" />
                  Cancel Event
                </button>
              </MenuItem>
            </MenuItems>
          </Portal>
        </Menu>
      </div>

      {/* Tab Content */}
      {detailTab === "overview" && (
        <div className="flex lg:flex-row flex-col gap-4 items-start">
          {/* Left: Event Preview Card */}
          <div className="w-full lg:w-[417px] shrink-0 bg-white border border-[#b0bfc9] rounded-lg p-3">
            <div className="flex flex-col gap-4">
              {/* Cover Image Preview */}
              <div className="relative w-full h-[150px] rounded-lg overflow-hidden bg-[#d5dde2]">
                {coverImage ? (
                  coverImage.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt="Event cover"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <Image
                      key={coverImage}
                      src={coverImage}
                      alt="Event cover"
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#eceff2]">
                    <div className="flex flex-col items-center gap-2 text-[#859bab]">
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-medium">Image placeholder</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Info Prevew */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#22292f] leading-[18px]">
                    {eventTitle || "Event Title"}
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
              <div className="w-[140px] flex flex-col gap-1">
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
                  <AriaSlider
                    label="Geo-Fence Radius"
                    unit="meters"
                    minValue={0}
                    maxValue={1000}
                    value={geoFenceRadius}
                    onChange={(v) => setGeoFenceRadius(v as number)}
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
              disabled={isSaving}
              onClick={() => {
                const dateIsoString = startDate?.toString() || null;
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
                  dateGroup: startDate
                    ? new Date(startDate.year, startDate.month - 1, startDate.day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "No Date",
                  date: dateIsoString || undefined,
                  dateIso: dateIsoString || undefined,
                };
                onSave(savedEvent);
              }}
              className="w-full min-h-[40px] bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Guests Tab Content */}
      {detailTab === "guests" && (
        <div className="flex flex-col gap-4">
          {/* Stats Row */}
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {/* Registered Guests */}
            <div className="bg-white border border-[#d5dde2] rounded-xl p-4 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-lg w-9 h-9 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#516778]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-none mb-1">Registered Guests</span>
                  <span className="text-xs font-normal text-[#516778] leading-none">Capacity limit</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-[#22292f] leading-none">42 / 50</span>
            </div>

            {/* Checked In */}
            <div className="bg-white border border-[#d5dde2] rounded-xl p-4 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-lg w-9 h-9 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path d="M10.667 2H13.333C13.687 2 14 2.313 14 2.667V13.333C14 13.687 13.687 14 13.333 14H10.667" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.667 11.333L10 8L6.667 4.667M2 8H10" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-none mb-1">Checked In</span>
                  <span className="text-xs font-normal text-[#516778] leading-none">0% of registered</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-[#22292f] leading-none">0</span>
            </div>

            {/* Checked Out */}
            <div className="bg-white border border-[#d5dde2] rounded-xl p-4 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-lg w-9 h-9 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path d="M10.667 2H13.333C13.687 2 14 2.313 14 2.667V13.333C14 13.687 13.687 14 13.333 14H10.667" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11.333L13.333 8L10 4.667M2 8H13.333" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-none mb-1">Checked Out</span>
                  <span className="text-xs font-normal text-[#516778] leading-none">0% of checked in</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-[#22292f] leading-none">0</span>
            </div>

            {/* Booked */}
            <div className="bg-white border border-[#d5dde2] rounded-xl p-4 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-lg w-9 h-9 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#516778" strokeWidth="1.33" />
                    <path d="M8 5V8L10 10" stroke="#516778" strokeWidth="1.33" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] leading-none mb-1">Booked</span>
                  <span className="text-xs font-normal text-[#516778] leading-none">Checked-in</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-[#22292f] leading-none">0</span>
            </div>
          </div>


          {/* Guest List Container */}
          <div className="bg-white border border-[#d5dde2] rounded-xl p-4 flex flex-col gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            {/* Guest List Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-[#22292f]">Guest List</h3>
                <span className="text-sm text-[#859bab]">All registered guests for this event</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedGuests.size === 0) return;
                    // CSV Export Logic
                    const guestsToExport = guests.filter(g => selectedGuests.has(g.id));
                    const csvContent = [
                      ["ID", "Name", "Email", "Registration Time", "Ticket ID", "Status"],
                      ...guestsToExport.map(g => [g.id, g.name, g.email, g.registrationTime, g.ticketId, g.status])
                    ].map(e => e.join(",")).join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `guests_export_${new Date().toISOString()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toastQueue.add({
                      title: "Export Successful",
                      description: `Exported ${selectedGuests.size} guests to CSV.`,
                      type: "success"
                    });
                  }}
                  disabled={selectedGuests.size === 0}
                  className={`flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg transition-colors ${selectedGuests.size > 0
                    ? "bg-[#22292f] text-white hover:bg-[#3a4249]"
                    : "bg-[#eceff2] text-[#859bab] cursor-not-allowed"
                    }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.66699 5.83301L7.00033 8.16634L9.33366 5.83301" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 8.16634V1.74967" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Export CSV
                  {selectedGuests.size > 0 && (
                    <span className="bg-white text-[#22292f] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {selectedGuests.size}
                    </span>
                  )}
                </button>
                <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
                  Add User
                </button>
              </div>
            </div>

            {/* Search + Filter Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg flex-1 max-w-[320px]" data-node-id="1818:15105">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7.333" cy="7.333" r="4.667" stroke="#859bab" strokeWidth="1.33" /><path d="M14 14L10.667 10.667" stroke="#859bab" strokeWidth="1.33" strokeLinecap="round" /></svg>
                <input
                  type="text"
                  placeholder="Search Name, Email"
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                />
                <span className="text-[#859bab] text-xs font-medium">⌘K</span>
              </div>
              <Menu>
                <MenuButton className="h-8 px-3 bg-[#eceff2] rounded-lg flex items-center gap-2 text-sm font-medium text-[#22292f] hover:bg-[#d5dde2] transition-colors">
                  {guestStatusFilter === "all" ? "All Guests" :
                    guestStatusFilter === "checked-in" ? "Checked In" :
                      guestStatusFilter === "not-checked-in" ? "Not Checked In" :
                        guestStatusFilter === "booked" ? "Booked" : "Cancelled"}
                  <ChevronDown className="w-4 h-4 text-[#516778]" />
                </MenuButton>
                <Portal>
                  <MenuItems
                    anchor="bottom end"
                    transition
                    className="z-[100] mt-1 bg-white border border-[#d5dde2] rounded-xl p-1 shadow-lg w-[160px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                  >
                    <MenuItem>
                      <button
                        onClick={() => setGuestStatusFilter("all")}
                        className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                      >
                        All Guests
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setGuestStatusFilter("checked-in")}
                        className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                      >
                        Checked In
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setGuestStatusFilter("not-checked-in")}
                        className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                      >
                        Not Checked In
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setGuestStatusFilter("booked")}
                        className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                      >
                        Booked
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setGuestStatusFilter("cancelled")}
                        className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                      >
                        Cancelled
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Portal>
              </Menu>
            </div>

            {/* Guest Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[40px]" />
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="[&>th]:bg-[#eceff2] [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                    <th className="h-9 px-3 py-2 text-left">
                      <AriaCheckbox
                        isSelected={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                        isIndeterminate={selectedGuests.size > 0 && selectedGuests.size < filteredGuests.length}
                        onChange={(isSelected) => {
                          if (isSelected) {
                            setSelectedGuests(new Set(filteredGuests.map(g => g.id)));
                          } else {
                            setSelectedGuests(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Name
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Email
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Registration Time
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Ticket ID
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Ticket QR
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]">
                      <div className="flex items-center gap-1">
                        Status
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guestsToDisplay.map((guest) => {
                    const isSelected = selectedGuests.has(guest.id);
                    return (
                      <tr
                        key={guest.id}
                        className={`border-b border-[#eceff2] last:border-b-0 transition-colors ${isSelected ? "bg-[#d8e6ff]" : "hover:bg-[#f9fafb]"}`}
                      >
                        <td className="px-3 py-3">
                          <AriaCheckbox
                            isSelected={isSelected}
                            onChange={(checked) => {
                              const newSet = new Set(selectedGuests);
                              if (checked) {
                                newSet.add(guest.id);
                              } else {
                                newSet.delete(guest.id);
                              }
                              setSelectedGuests(newSet);
                            }}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-[#22292f]">
                            {guest.name}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-[#516778]">
                            {guest.email}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-[#516778]">
                            {guest.registrationTime}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-[#22292f]">
                            {guest.ticketId}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-white border border-[#d5dde2] rounded-md text-xs font-medium text-[#516778] hover:bg-[#f9fafb] transition-colors">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="#516778" strokeWidth="1" />
                              <rect x="3.5" y="3.5" width="2.5" height="2.5" fill="#516778" />
                              <rect x="8" y="3.5" width="2.5" height="2.5" fill="#516778" />
                              <rect x="3.5" y="8" width="2.5" height="2.5" fill="#516778" />
                              <rect x="8" y="8" width="2.5" height="2.5" fill="#516778" />
                            </svg>
                            View QR
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          {guest.status === "checked-in" && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#22892e] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" fill="#22892e" />
                                <path d="M4.5 7L6.25 8.75L9.5 5.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Checked-In
                            </span>
                          )}
                          {guest.status === "not-checked-in" && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded-full">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" fill="#d97706" />
                                <path d="M7 5.5V7.5M7 9.25V9.26" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                              Not Checked-In
                            </span>
                          )}
                          {guest.status === "booked" && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#22892e] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" fill="#22892e" />
                                <path d="M4.5 7L6.25 8.75L9.5 5.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Booked
                            </span>
                          )}
                          {guest.status === "cancelled" && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#dc2626] bg-[#fee2e2] px-2 py-0.5 rounded-full">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" fill="#dc2626" />
                                <path d="M5 5L9 9M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                Page <span className="font-semibold text-[#22292f]">{guestPage}</span> of <span className="text-[#3f52ff]">{totalGuestPages}</span>
              </span>
              <button
                onClick={() => setGuestPage(p => Math.min(totalGuestPages, p + 1))}
                disabled={guestPage >= totalGuestPages}
                className="w-8 h-8 flex items-center justify-center border border-[#d5dde2] rounded-lg bg-white text-[#516778] hover:bg-[#f9fafb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab Content */}
      {detailTab === "analytics" && (
        <AnalyticsView />
      )}
      {showCancelModal && (
        <CancelEventModal
          onClose={() => setShowCancelModal(false)}
          eventTitle={eventTitle}
          guestCount={342}
        />
      )}
      {showSlidoModal && (
        <SlidoEmbedModal
          onClose={() => setShowSlidoModal(false)}
        />
      )}
      <CloneEventModal
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        onClone={(startDate, startTime, endDate, endTime) => {
          // Handle clone logic here
          setShowCloneModal(false);
          toastQueue.add({
            title: "Event Cloned",
            description: `Event "${eventTitle}" has been cloned successfully.`,
            type: "success"
          });
        }}
        eventTitle={eventTitle}
      />
    </div>
  );
}

function SlidoEmbedModal({ onClose }: { onClose: () => void }) {
  const [embedCode, setEmbedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      toastQueue.add({
        title: "Slido Embed Saved",
        description: "Your Slido interactive poll has been added to the event.",
        type: "success"
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white border border-[#d5dde2] rounded-xl w-full max-w-[560px] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d5dde2]">
          <div className="flex items-center gap-3">
            <div className="bg-[#d8e6ff] border border-[#8faeff] rounded-lg p-3 flex items-center justify-center">
              <Code className="w-4 h-4 text-[#3f52ff]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-[#22292f]">Slido Embed</h2>
              <p className="text-xs text-[#859bab]">Add interactive polls and Q&A to your event with Slido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
          >
            <X className="w-4 h-4 text-[#516778]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder='<iframe src="...."></iframe>'
              className="w-full min-h-[180px] p-4 bg-white border border-[#d5dde2] rounded-xl text-sm text-[#22292f] focus:border-[#3f52ff] outline-none transition-colors resize-none placeholder:text-[#859bab] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#859bab]" />
            <span className="text-sm text-[#859bab]">Copy the embed code from Slido and paste it here</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#d5dde2]">
          <button
            onClick={onClose}
            className="h-10 px-6 text-sm font-semibold text-[#3f52ff] bg-[#d8e6ff]/50 rounded-lg hover:bg-[#d8e6ff] transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !embedCode.trim()}
            className="h-10 px-6 text-sm font-semibold text-white bg-[#3f52ff] rounded-lg hover:bg-[#3545e0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Embed Code
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface CancelModalProps {
  onClose: () => void;
  eventTitle: string;
  guestCount: number;
}

function CancelEventModal({ onClose, eventTitle, guestCount }: CancelModalProps) {
  const [customiseNotification, setCustomiseNotification] = useState(false);
  const [subject, setSubject] = useState(`${eventTitle} Cancelled`);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancelEvent = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      toastQueue.add({
        title: "Event Cancelled",
        description: `"${eventTitle}" has been successfully cancelled.`,
        type: "success"
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white border border-[#d5dde2] rounded-xl w-full max-w-[480px] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d5dde2]">
          <div className="flex items-center gap-3">
            <div className="bg-[#ffe1e1] rounded-lg p-2 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-[#e53935]" />
            </div>
            <h2 className="text-base font-semibold text-[#22292f]">Cancel Event</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
          >
            <X className="w-4 h-4 text-[#516778]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm font-medium text-[#859bab] leading-relaxed">
            If you aren&apos;t able to host your event, you can cancel and we&apos;ll notify your guests. This event will be permanently deleted.
          </p>

          {/* Toggle Section */}
          <AriaSwitch
            isSelected={customiseNotification}
            onChange={setCustomiseNotification}
            className="flex-row-reverse justify-between w-full"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#22292f]">Customise Notification</span>
              <span className="text-xs text-[#859bab]">Send a custom message to guests</span>
            </div>
          </AriaSwitch>

          {customiseNotification && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#22292f]">Notification Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#d5dde2] rounded-lg text-sm text-[#22292f] focus:border-[#3f52ff] outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Custom Message"
                    className="w-full min-h-[120px] p-3 bg-white border border-[#d5dde2] rounded-lg text-sm text-[#22292f] focus:border-[#3f52ff] outline-none transition-colors resize-none placeholder:text-[#859bab]"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#eceff2] rounded text-[10px] font-medium text-[#859bab]">
                    {message.length}/280 characters
                  </div>
                  <div className="absolute bottom-3 right-3 w-7 h-7 bg-[#eceff2] rounded flex items-center justify-center">
                    <ArrowUp className="w-3.5 h-3.5 text-[#859bab]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          <div className="bg-[#fff3dc] border border-[#ffedc2] rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
            <p className="text-sm text-[#22292f] leading-relaxed">
              This action cannot be undone. <span className="font-bold">{guestCount} registered guests will be notified.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-[#d5dde2]">
          <button
            onClick={onClose}
            className="flex-1 h-11 px-4 text-sm font-semibold text-[#22292f] bg-white border border-[#d5dde2] rounded-xl hover:bg-[#f5f5f5] transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleCancelEvent}
            disabled={loading}
            className="flex-1 h-11 px-4 text-sm font-semibold text-white bg-[#e53935] rounded-xl hover:bg-[#c62828] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Cancel Event
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Analytics Tab Components ---

function AnalyticsView() {
  const [timeFilter, setTimeFilter] = useState("Last 24 Hours");

  // Generate mock data based on time filter
  const getChartData = () => {
    if (timeFilter === "Last 24 Hours") {
      // Hourly data for 24 hours (0h to 24h)
      return Array.from({ length: 25 }, (_, i) => ({
        label: `${i}h`,
        value: Math.floor(Math.random() * 40) + 10, // Random values between 10-50
      }));
    } else if (timeFilter === "Last 7 days") {
      // Daily data for 7 days
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map(day => ({
        label: day,
        value: Math.floor(Math.random() * 60) + 20,
      }));
    } else if (timeFilter === "Last 30 days") {
      // Weekly data for 30 days (4 weeks)
      return ["Week 1", "Week 2", "Week 3", "Week 4"].map(week => ({
        label: week,
        value: Math.floor(Math.random() * 80) + 30,
      }));
    } else {
      // Monthly data for 60 days (2 months)
      return ["Month 1", "Month 2"].map(month => ({
        label: month,
        value: Math.floor(Math.random() * 100) + 40,
      }));
    }
  };

  const chartData = getChartData();
  const maxDataValue = Math.max(...chartData.map(d => d.value));
  const chartHeight = 280; // Fixed chart height

  // Calculate dynamic Y-axis max and step
  // Round up to a nice number (next multiple of 10, 50, 100, etc.)
  const calculateYAxisMax = (max: number): number => {
    if (max <= 10) return 10;
    if (max <= 50) return Math.ceil(max / 10) * 10;
    if (max <= 100) return Math.ceil(max / 10) * 10;
    if (max <= 500) return Math.ceil(max / 50) * 50;
    if (max <= 1000) return Math.ceil(max / 100) * 100;
    return Math.ceil(max / 500) * 500;
  };

  const yAxisMax = calculateYAxisMax(maxDataValue);
  const yAxisStep = yAxisMax / 10; // Always 10 steps for consistency

  // Generate Y-axis labels (from max to step, descending)
  const yAxisLabels = Array.from({ length: 10 }, (_, i) => yAxisMax - (i * yAxisStep));

  // Get footer text based on filter
  const getFooterText = () => {
    switch (timeFilter) {
      case "Last 24 Hours": return "Registrations in the last 24 hours";
      case "Last 7 days": return "Registrations in the last 7 days";
      case "Last 30 days": return "Registrations in the last 30 days";
      case "Last 60 days": return "Registrations in the last 60 days";
      default: return "Registrations over time";
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Stats Row - matching Guests tab style with unified border container */}
      <div className="flex items-stretch border border-[#d5dde2] rounded-lg bg-white">
        {/* Total Registrations */}
        <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
          <div className="flex items-center gap-2">
            <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#516778]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Total Registrations</span>
              <span className="text-xs font-normal text-[#516778] leading-[18px]">68% of capacity</span>
            </div>
          </div>
          <span className="text-base font-semibold text-[#22292f] leading-[18px]">342</span>
        </div>
        {/* Checked In Users */}
        <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
          <div className="flex items-center gap-2">
            <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <LogIn className="w-4 h-4 text-[#516778]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Checked In Users</span>
              <span className="text-xs font-normal text-[#516778] leading-[18px]">0% attendance rate</span>
            </div>
          </div>
          <span className="text-base font-semibold text-[#22292f] leading-[18px]">0</span>
        </div>
        {/* Checked Out Users */}
        <div className="flex-1 flex items-center justify-between p-4 border-r border-[#d5dde2]">
          <div className="flex items-center gap-2">
            <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <LogOut className="w-4 h-4 text-[#516778]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Checked Out Users</span>
              <span className="text-xs font-normal text-[#516778] leading-[18px]">0% of checked in</span>
            </div>
          </div>
          <span className="text-base font-semibold text-[#22292f] leading-[18px]">0</span>
        </div>
        {/* Booked Users */}
        <div className="flex-1 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#516778]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Booked Users</span>
              <span className="text-xs font-normal text-[#516778] leading-[18px]">Checked-in</span>
            </div>
          </div>
          <span className="text-base font-semibold text-[#22292f] leading-[18px]">2</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#22292f] leading-[18px]">Registrations Over Time</span>
            <span className="text-xs font-normal text-[#859bab] leading-[18px]">Track how registrations grew over time</span>
          </div>
          <Menu>
            <MenuButton className="h-8 px-3 bg-[#eceff2] rounded-lg flex items-center gap-1 text-xs font-medium text-[#22292f] hover:bg-[#d5dde2] transition-colors">
              {timeFilter}
              <ChevronDown className="w-4 h-4" />
            </MenuButton>
            <Portal>
              <MenuItems
                anchor="bottom end"
                transition
                className="z-[100] mt-1 bg-white border border-[#d5dde2] rounded-xl p-1 shadow-lg w-[140px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
              >
                {["Last 24 Hours", "Last 7 days", "Last 30 days", "Last 60 days"].map((option) => (
                  <MenuItem key={option}>
                    <button
                      onClick={() => setTimeFilter(option)}
                      className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-[#22292f] data-[focus]:bg-[#eceff2] hover:bg-[#eceff2] transition-colors focus:outline-none"
                    >
                      {option}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Portal>
          </Menu>
        </div>

        {/* Chart Area */}
        <div className="flex w-full">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between pr-3 shrink-0" style={{ height: chartHeight }}>
            {yAxisLabels.map(val => (
              <span key={val} className="text-sm font-semibold text-[#859bab] leading-[18px]">{val}</span>
            ))}
          </div>

          {/* Chart container */}
          <div className="flex-1 flex flex-col">
            {/* Bars area */}
            <div className="flex-1 relative" style={{ height: chartHeight }}>
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {yAxisLabels.map((_, i) => (
                  <div key={i} className="border-b border-[#eceff2]" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-[2px] px-1">
                {chartData.map((item, index) => {
                  const barHeight = (item.value / yAxisMax) * chartHeight;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center justify-end group"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#22292f] text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap">
                        {item.value}
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full bg-[#3f52ff] rounded-t-sm transition-all duration-300 hover:bg-[#2a3bcc] min-w-[4px]"
                        style={{ height: barHeight }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex gap-[2px] px-1 mt-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex justify-center min-w-0">
                  <span className="text-sm font-semibold text-[#859bab] leading-[18px] truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center">
          <span className="text-sm font-normal text-[#859bab]">{getFooterText()}</span>
        </div>
      </div>

      {/* Bottom Tables Row */}
      <div className="flex gap-4">
        {/* Check-In Summary */}
        <div className="flex-1 bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
          <span className="text-base font-semibold text-[#668091] leading-[18px]">Check-In Summary</span>
          <div className="flex flex-col gap-2 text-sm leading-[18px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#22292f]">Total Registered</span>
              <span className="font-semibold text-[#859bab]">342</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Checked In</span>
              <span className="font-semibold text-[#859bab]">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Checked Out</span>
              <span className="font-semibold text-[#859bab]">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Still Inside</span>
              <span className="font-semibold text-[#859bab]">0</span>
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="flex-1 bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
          <span className="text-base font-semibold text-[#668091] leading-[18px]">Event Information</span>
          <div className="flex flex-col gap-2 text-sm leading-[18px]">
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Event Type</span>
              <span className="font-semibold text-[#859bab]">General Event</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Mode</span>
              <span className="font-semibold text-[#859bab]">On Site</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Language</span>
              <span className="font-semibold text-[#859bab]">English</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#22292f]">Capacity</span>
              <span className="font-semibold text-[#859bab]">500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Delete Event Confirmation Modal ---
function DeleteEventModal({
  event,
  onClose,
  onConfirm,
  isDeleting,
}: {
  event: EventItem;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border border-[#d5dde2] rounded-xl w-[420px] flex flex-col gap-4 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-[#d5dde2]">
          <div className="flex items-center gap-4">
            <div className="bg-[#ffe0e1] rounded-md p-2">
              <AlertCircle className="w-4 h-4 text-[#e53935]" />
            </div>
            <span className="text-base font-semibold text-[#22292f]">
              Delete Event
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#516778]" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="px-4">
          <p className="text-sm font-semibold text-[#859bab] leading-[20px]">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[#22292f]">
              &quot;{event.title}&quot;
            </span>
            ? This action cannot be undone and will permanently remove the event
            and all associated data.
          </p>
        </div>
        {/* Modal Footer */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-[#d5dde2]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium text-[#22292f] bg-white border border-[#d5dde2] rounded-lg hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-[#e53935] rounded-lg hover:bg-[#c62828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Event Card Component ---
function EventCard({ event, onClick, onDelete }: { event: EventItem; onClick: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Parse date for display
  const getDateParts = () => {
    if (!event.dateIso) return { month: "OCT", day: "25", weekday: "samedi", fullDate: "25 octobre", time: "12:00 - 14:00 UTC+4" };
    const date = new Date(event.dateIso);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthsFull = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return {
      month: months[date.getMonth()],
      day: date.getDate().toString(),
      weekday: weekdays[date.getDay()],
      fullDate: `${date.getDate()} ${monthsFull[date.getMonth()]}`,
      time: "12:00 - 14:00 UTC+4"
    };
  };

  const dateParts = getDateParts();

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#b0bfc9] rounded-lg p-3 flex flex-col flex-1 min-w-0 cursor-pointer hover:border-[#3f52ff] transition-all group"
    >
      <div className="flex flex-col gap-4">
        {/* Cover Image */}
        <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-[#d5dde2]">
          {event.coverImage?.startsWith("data:") || event.coverImage?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : event.coverImage ? (
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
          ) : null}
          {/* Centered User Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] bg-[#3f52ff] rounded-full border-[3px] border-white flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          {/* 3-dot menu */}
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[#22292f]" />
            </button>
            {menuOpen && (
              <div className="absolute top-9 right-0 bg-[#f9fafb] border border-[#d5dde2] rounded-xl p-1 shadow-lg z-50 min-w-[100px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onClick();
                  }}
                  className="flex items-center gap-2 w-full h-8 px-2 rounded text-sm font-medium text-[#22292f] hover:bg-[#eceff2] transition-colors"
                >
                  <Eye className="w-4 h-4 text-[#516778]" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 w-full h-8 px-2 rounded text-sm font-medium text-[#e22023] hover:bg-[#eceff2] transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-[#e22023]" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Title + Badges */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#22292f] leading-[18px]">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] text-white text-xs font-medium rounded">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                </svg>
                {event.chapter}
              </span>
              <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] text-white text-xs font-medium rounded">
                {event.type}
              </span>
            </div>
          </div>

          {/* Date & Venue Row */}
          <div className="flex items-start gap-8 flex-wrap">
            {/* Date Section */}
            <div className="flex items-center gap-2">
              {/* Date Box */}
              <div className="w-10 h-11 border border-[#859bab] rounded-lg overflow-hidden flex flex-col">
                <div className="bg-[#859bab] px-1 py-1 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white/80 uppercase leading-[12px]">{dateParts.month}</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-base font-medium text-[#859bab] leading-none">{dateParts.day}</span>
                </div>
              </div>
              {/* Date Text */}
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-medium text-[#22292f] leading-6">{dateParts.weekday} {dateParts.fullDate}</span>
                <span className="text-sm font-normal text-[#859bab] leading-[21px]">{dateParts.time}</span>
              </div>
            </div>

            {/* Venue Section */}
            <div className="flex items-center gap-2">
              {/* Venue Icon Box */}
              <div className="w-10 h-10 border border-[#859bab] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10.625C11.3807 10.625 12.5 9.50571 12.5 8.125C12.5 6.74429 11.3807 5.625 10 5.625C8.61929 5.625 7.5 6.74429 7.5 8.125C7.5 9.50571 8.61929 10.625 10 10.625Z" stroke="#859bab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 18.125C13.125 15 16.25 11.6421 16.25 8.125C16.25 4.60786 13.5171 1.875 10 1.875C6.48286 1.875 3.75 4.60786 3.75 8.125C3.75 11.6421 6.875 15 10 18.125Z" stroke="#859bab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Venue Text */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-[#22292f] leading-6">Alura</span>
                  <ArrowUp className="w-4 h-4 text-[#22292f]/50 rotate-45" />
                </div>
                <span className="text-sm font-normal text-[#859bab] leading-[21px]">Dubai, Dubai</span>
              </div>
            </div>
          </div>

          {/* Location + Signups */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#22292f] shrink-0" />
              <span className="text-sm font-normal text-[#22292f] leading-[18px]">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardPenLine className="w-4 h-4 text-[#22292f] shrink-0" />
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

// Helper to convert database event to EventItem
function dbEventToEventItem(dbEvent: any): EventItem {
  const eventDate = dbEvent.event_date ? new Date(dbEvent.event_date) : null;
  const dateGroup = eventDate
    ? eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "No Date";

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    coverImage: dbEvent.cover_image || "/img/event-cover-1.jpg",
    chapter: dbEvent.chapter || "Dubai Chapter",
    type: dbEvent.type || "Onsite",
    eventCategory: dbEvent.event_category || "general",
    date: dbEvent.event_date,
    dateIso: dbEvent.event_date,
    location: dbEvent.location || "",
    signups: dbEvent.signups || 0,
    maxSignups: dbEvent.max_signups || 300,
    dateGroup,
  };
}

function EventsPageContent({ currentUser }: EventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "current" | "past">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | "general" | "match">("all");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<DateValue | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load events from database on mount
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEvents();
      if (result.success && result.data) {
        const eventItems = result.data.map(dbEventToEventItem);
        setEvents(eventItems);
      } else {
        console.error("Failed to load events:", result.error);
        // Fall back to empty array if no events
        setEvents([]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
        setShowCreateEvent(false); // Not creating, editing
      } else {
        setSelectedEvent(null);
        setShowCreateEvent(false);
      }
    } else if (create === "true") {
      setSelectedEvent(null);
      setShowCreateEvent(true); // Creating new event
    } else {
      setSelectedEvent(null);
      setShowCreateEvent(false);
    }
  }, [searchParams, events]);

  const [isSaving, setIsSaving] = useState(false);

  // Helper function to convert base64 to File
  const base64ToFile = (base64: string, filename: string): File | null => {
    try {
      const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;

      const mimeType = matches[1];
      const base64Content = matches[2];
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const extension = mimeType.split('/')[1] || 'jpg';

      return new File([blob], `${filename}.${extension}`, { type: mimeType });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      return null;
    }
  };

  // Upload image using the API endpoint
  const uploadCoverImage = async (base64Data: string): Promise<string | null> => {
    try {
      const file = base64ToFile(base64Data, `event-cover-${Date.now()}`);
      if (!file) {
        console.error("Failed to convert base64 to file");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "events");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData.error);
        return null;
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSaveEvent = async (savedEvent: EventItem) => {
    setIsSaving(true);
    try {
      let coverImageUrl: string | null = savedEvent.coverImage || null;

      // If cover image is base64, upload it first using API
      if (savedEvent.coverImage?.startsWith('data:')) {
        const uploadedUrl = await uploadCoverImage(savedEvent.coverImage);

        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        } else {
          // If upload fails, continue without the image but show warning
          coverImageUrl = null;
          toastQueue.add({
            title: "Image Upload Failed",
            description: "Event will be saved without the cover image.",
            variant: "error",
          }, { timeout: 3000 });
        }
      }

      const eventData = {
        title: savedEvent.title,
        cover_image: coverImageUrl,
        chapter: savedEvent.chapter,
        type: savedEvent.type,
        event_category: savedEvent.eventCategory,
        event_date: savedEvent.dateIso || savedEvent.date || null,
        location: savedEvent.location,
        signups: savedEvent.signups,
        max_signups: savedEvent.maxSignups,
      };

      if (selectedEvent) {
        // Update existing event in database
        const result = await updateEvent(selectedEvent.id, eventData);
        if (result.success) {
          const updatedEvent = { ...savedEvent, coverImage: coverImageUrl || savedEvent.coverImage };
          setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? updatedEvent : e)));
          toastQueue.add({
            title: "Event Updated",
            description: `"${savedEvent.title}" has been successfully updated.`,
            variant: "success",
          }, { timeout: 3000 });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new event in database
        const result = await createEvent(eventData);
        if (result.success && result.data) {
          const newEvent = dbEventToEventItem(result.data);
          setEvents((prev) => [newEvent, ...prev]);
          toastQueue.add({
            title: "Event Created",
            description: `"${savedEvent.title}" has been successfully created.`,
            variant: "success",
          }, { timeout: 3000 });
        } else {
          throw new Error(result.error);
        }
      }
      handleClose();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toastQueue.add({
        title: "Error",
        description: error.message || "Failed to save event. Please try again.",
        variant: "error",
      }, { timeout: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for the new CreateEventScreen component
  const handleSaveNewEvent = async (formData: EventFormData) => {
    setIsSaving(true);
    try {
      let coverImageUrl: string | null = formData.coverImage || null;

      // If cover image is base64, upload it first using API
      if (formData.coverImage?.startsWith('data:')) {
        const uploadedUrl = await uploadCoverImage(formData.coverImage);

        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        } else {
          // If upload fails, continue without the image but show warning
          coverImageUrl = null;
          toastQueue.add({
            title: "Image Upload Failed",
            description: "Event will be saved without the cover image.",
            variant: "error",
          }, { timeout: 3000 });
        }
      }

      // Convert date to ISO string
      const eventDateIso = formData.startDate
        ? `${formData.startDate.year}-${String(formData.startDate.month).padStart(2, '0')}-${String(formData.startDate.day).padStart(2, '0')}`
        : null;

      // Determine capacity
      const maxSignups = formData.capacity === "Unlimited" ? 9999 : parseInt(formData.capacity) || 300;

      const eventData = {
        title: formData.title,
        cover_image: coverImageUrl,
        chapter: formData.chapter + " Chapter",
        type: formData.type,
        event_category: formData.eventCategory,
        event_date: eventDateIso,
        location: formData.location,
        signups: 0,
        max_signups: maxSignups,
        description: formData.description,
      };

      // Create new event in database
      const result = await createEvent(eventData);
      if (result.success && result.data) {
        const newEvent = dbEventToEventItem(result.data);
        setEvents((prev) => [newEvent, ...prev]);
        toastQueue.add({
          title: "Event Created",
          description: `"${formData.title}" has been successfully created.`,
          variant: "success",
        }, { timeout: 3000 });
        handleClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toastQueue.add({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "error",
      }, { timeout: 4000 });
    } finally {
      setIsSaving(false);
    }
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

  const handleDeleteEvent = (event: EventItem) => {
    setEventToDelete(event);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventToDelete.id);
      if (result.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        toastQueue.add({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
          variant: "success",
        }, { timeout: 3000 });
        setEventToDelete(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toastQueue.add({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "error",
      }, { timeout: 4000 });
    } finally {
      setIsDeleting(false);
    }
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
          {showCreateEvent ? (
            /* New Create Event Screen from Figma design */
            <CreateEventScreen
              onClose={handleClose}
              onSave={handleSaveNewEvent}
              isSaving={isSaving}
            />
          ) : selectedEvent ? (
            /* Edit Event Screen (existing CreateEventView) */
            <CreateEventView
              event={selectedEvent}
              onClose={handleClose}
              onSave={handleSaveEvent}
              isSaving={isSaving}
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
                <div className="inline-flex items-center gap-2 bg-[#dfe3e8] rounded-[32px] p-[6px]">
                  {([
                    { key: "general", label: "General Event" },
                    { key: "match", label: "Match" },
                  ] as const).map((tab) => {
                    const isActive = filterCategory === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setFilterCategory(tab.key)}
                        className={`relative px-5 py-2 rounded-[26px] text-sm font-semibold transition-colors ${isActive
                          ? "bg-white text-[#3f52ff] shadow-[0px_1px_3px_rgba(0,0,0,0.12)]"
                          : "text-[#516778]"
                          }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base font-semibold text-[#22292f] leading-[18px]">
                    {filterCategory === "general" ? generalCount : matchCount}
                  </span>
                  <span className="text-xs font-normal text-[#516778] leading-[18px]">
                    {filterCategory === "general" ? `${generalPercent}% of total` : `${matchPercent}% of total`}
                  </span>
                </div>
              </div>
              </div>

              {/* Tabs + Filters Bar */}
              <div className="flex items-center justify-between">
                {/* Left: Event tabs */}
                <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative self-start w-fit">
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
                    <div className="w-[110px]">
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

              {/* Events Content: Loading, Empty State or Events List */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-[#d5dde2] rounded-xl">
                  <Loader2 className="w-8 h-8 text-[#3f52ff] animate-spin" />
                  <p className="text-sm text-[#859bab]">Loading events...</p>
                </div>
              ) : hasEvents ? (
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

                        {/* Events Grid - 3 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {events.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onClick={() => handleEditEvent(event)}
                              onDelete={() => handleDeleteEvent(event)}
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
              ) : (
                /* Empty State - No Events Created Yet */
                <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-[#d5dde2] rounded-xl">
                  <Image
                    src="/img/events-empty.svg"
                    alt="No events"
                    width={165}
                    height={160}
                    className="object-contain"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <h3 className="text-lg font-semibold text-[#22292f]">No events yet</h3>
                    <p className="text-sm text-[#859bab] text-center max-w-xs">
                      You haven&apos;t created any events yet. <br /> Click the button below to create your first event.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateEvent}
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

      {/* Delete Event Confirmation Modal */}
      {eventToDelete && (
        <DeleteEventModal
          event={eventToDelete}
          onClose={() => setEventToDelete(null)}
          onConfirm={confirmDeleteEvent}
          isDeleting={isDeleting}
        />
      )}
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
