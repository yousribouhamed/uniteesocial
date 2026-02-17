"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Filter,
  Users,
  ClipboardPenLine,
  Plus,
  MapPin,
  ChevronDown,
  MoreVertical,
  Camera,
  Clock,
  Globe,
  Link,
  Link2,
  Ticket,
  Upload,
  Info,
  ChevronsUpDown,
  MoreHorizontal,
  Copy,
  Code,
  XCircle,
  AlertCircle,
  X,
  ArrowUp,
  ArrowUpRight,
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
import { getEvents, createEvent, updateEvent, deleteEvent, EventData } from "./actions";
import { CreateEventScreen, EventFormData } from "./create-event-screen";
import { CloneEventModal } from "@/components/clone-event-modal";

// --- Types ---
interface EventItem {
  id: string;
  title: string;
  coverImage: string;
  chapter: string;
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  enableLineUpAnnouncement?: boolean;
  lineUpAnnouncementTime?: string;
  homeTeamLineup?: string;
  awayTeamLineup?: string;
  livestreamUrl?: string;
  stadiumVenueName?: string;
  ticketsUrl?: string;
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

const DEFAULT_TEAMS = ["Al-Hilal", "Etihad Jeddah", "Al-Nassr"];
const MAX_UPLOAD_IMAGE_SIZE = 10 * 1024 * 1024;

function EventPreviewCard({
  coverImage,
  eventTitle,
  badgeLabel,
  type,
  displayMonth,
  displayDay,
  startDate,
  startTime,
  endTime,
  locationInput,
  signups,
  maxSignups,
  onEditImage,
}: {
  coverImage: string;
  eventTitle: string;
  badgeLabel: string;
  type: "Onsite" | "Online" | "Hybrid";
  displayMonth: string;
  displayDay: string;
  startDate: DateValue | null;
  startTime: string;
  endTime: string;
  locationInput: string;
  signups: number;
  maxSignups: number;
  onEditImage?: () => void;
}) {
  return (
    <div className="w-full lg:w-[493px] shrink-0 bg-card border border-border rounded-lg p-3 flex flex-col gap-4 h-fit">
      {/* Cover Image */}
      <button
        type="button"
        onClick={onEditImage}
        className={`relative w-full h-[264px] rounded-lg overflow-hidden bg-muted ${onEditImage ? "cursor-pointer group" : "cursor-default"}`}
      >
        {coverImage ? (
          coverImage.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="Event cover"
              className="w-full h-full object-cover"
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
          <div className="w-full h-full bg-muted" />
        )}
        {onEditImage && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 text-foreground text-sm font-medium">
              <Camera className="w-4 h-4" />
              Replace image
            </div>
          </div>
        )}
      </button>

      {/* Event Info */}
      <div className="flex flex-col gap-4">
        {/* Title + Badges */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground leading-[18px]">
            {eventTitle || "Event name"}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-xs font-medium rounded">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
              </svg>
              {badgeLabel}
            </span>
            <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
              {type}
            </span>
          </div>
        </div>

        {/* Date & Venue Row */}
        <div className="flex items-start gap-8 flex-wrap">
          {/* Date Section */}
          <div className="flex items-center gap-2">
            {/* Date Box */}
            <div className="w-10 h-11 border border-border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-[#859BAB] px-0.5 py-1 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white/80 uppercase leading-[12px]">{displayMonth}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-base font-medium text-muted-foreground leading-none">{displayDay}</span>
              </div>
            </div>
            {/* Date Text */}
            <div className="flex flex-col gap-px">
              <span className="text-base font-medium text-foreground leading-[24px]">
                {startDate ? (() => {
                  const weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
                  const d = new Date(startDate.year, startDate.month - 1, startDate.day);
                  const monthsFull = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
                  return `${weekdays[d.getDay()]} ${startDate.day} ${monthsFull[startDate.month - 1]}`;
                })() : "samedi 25 octobre"}
              </span>
              <span className="text-sm font-normal text-muted-foreground leading-[21px]">
                {startTime} - {endTime} UTC+4
              </span>
            </div>
          </div>

          {/* Venue Section */}
          <div className="flex items-center gap-2">
            {/* Location Icon Box */}
            <div className="w-10 h-10 border border-border rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            {/* Venue Text */}
            <div className="flex flex-col gap-px">
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-foreground leading-[24px]">
                  {locationInput ? locationInput.split(",")[0] : "Lieu"}
                </span>
                <ArrowUpRight className="w-4 h-4 text-foreground opacity-50" />
              </div>
              <span className="text-sm font-normal text-muted-foreground leading-[21px]">
                {locationInput ? locationInput.split(",").slice(1, 3).join(",").trim() || "Dubai, Dubai" : "Dubai, Dubai"}
              </span>
            </div>
          </div>
        </div>

        {/* Address + Capacity */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-normal text-foreground leading-[18px]">
              {locationInput || "Dubai World Trade Center, DWC"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardPenLine className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-normal text-foreground leading-[18px]">
              {signups}/{maxSignups}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Create Event View ---
function CreateEventView({ event, onClose, onSave, isSaving = false }: { event: EventItem | null; onClose: () => void; onSave: (event: EventItem) => void; isSaving?: boolean }) {
  const [detailTab, setDetailTab] = useState<"overview" | "guests" | "analytics" | "advanced">("overview");
  const [language, setLanguage] = useState<"English" | "French" | "Arabic">("English");
  const isArabic = language === "Arabic";
  const t = (english: string, arabic?: string, french?: string) => {
    if (language === "Arabic") return arabic ?? english;
    if (language === "French") return french ?? english;
    return english;
  };
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
  const [locationPlaceId, setLocationPlaceId] = useState<string | null>(null);
  const [locationLatLng, setLocationLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [placePredictions, setPlacePredictions] = useState<Array<{ description: string; place_id: string }>>([]);
  const [isPlacesOpen, setIsPlacesOpen] = useState(false);
  const placesBoxRef = useRef<HTMLDivElement>(null);
  const [geoFenceRadius, setGeoFenceRadius] = useState(650);
  const [locationMasking, setLocationMasking] = useState(false);
  const [locationDescription, setLocationDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur. Et at quam phasellus accumsan neque tempus tincidunt tellus nulla. At consectetur sollicitudin at fames. Tristique molestie enim facilisi egestas."
  );
  const [eventDescription, setEventDescription] = useState(
    "Lorem ipsum dolor sit amet consectetur. Et at quam phasellus accumsan neque tempus tincidunt tellus nulla. At consectetur sollicitudin at fames. Tristique molestie enim facilisi egestas."
  );
  const [coverImage, setCoverImage] = useState(event?.coverImage || "");
  const isMatchEvent = event?.eventCategory === "match";
  const lineupOptions = [
    "15 min before match",
    "30 min before match",
    "45 min before match",
    "1 hour before match",
    "2 hours before match",
  ];
  const ticketGoLiveOptions = [
    "Immediately",
    "One Day Before",
    "Three Days Before",
    "One Week Before",
    "Custom Date",
  ];
  const translateLineupTime = (value: string) => {
    switch (value) {
      case "15 min before match":
        return t("15 min before match", "قبل 15 دقيقة من المباراة", "15 min avant le match");
      case "30 min before match":
        return t("30 min before match", "قبل 30 دقيقة من المباراة", "30 min avant le match");
      case "45 min before match":
        return t("45 min before match", "قبل 45 دقيقة من المباراة", "45 min avant le match");
      case "1 hour before match":
        return t("1 hour before match", "قبل ساعة من المباراة", "1 heure avant le match");
      case "2 hours before match":
        return t("2 hours before match", "قبل ساعتين من المباراة", "2 heures avant le match");
      default:
        return value;
    }
  };
  const translateTicketGoLive = (value: string) => {
    switch (value) {
      case "Immediately":
        return t("Immediately", "فوراً", "Immédiatement");
      case "One Day Before":
        return t("One Day Before", "قبل يوم واحد", "Un jour avant");
      case "Three Days Before":
        return t("Three Days Before", "قبل ثلاثة أيام", "Trois jours avant");
      case "One Week Before":
        return t("One Week Before", "قبل أسبوع", "Une semaine avant");
      case "Custom Date":
        return t("Custom Date", "تاريخ مخصص", "Date personnalisée");
      default:
        return value;
    }
  };
  const [league, setLeague] = useState(event?.league || "");
  const [homeTeam, setHomeTeam] = useState(event?.homeTeam || "");
  const [awayTeam, setAwayTeam] = useState(event?.awayTeam || "");
  const [enableLineUpAnnouncement, setEnableLineUpAnnouncement] = useState(Boolean(event?.enableLineUpAnnouncement));
  const [lineUpAnnouncementTime, setLineUpAnnouncementTime] = useState(event?.lineUpAnnouncementTime || "45 min before match");
  const [homeTeamLineup, setHomeTeamLineup] = useState(event?.homeTeamLineup || "");
  const [awayTeamLineup, setAwayTeamLineup] = useState(event?.awayTeamLineup || "");
  const [matchLocationType, setMatchLocationType] = useState<"onsite" | "virtual">(
    event?.eventCategory === "match" ? (event?.type === "Online" ? "virtual" : "onsite") : "onsite"
  );
  const [livestreamUrl, setLivestreamUrl] = useState(event?.livestreamUrl || "");
  const [stadiumVenueName, setStadiumVenueName] = useState(event?.stadiumVenueName || "");
  const [matchLocationMasking, setMatchLocationMasking] = useState(false);
  const [matchDescription, setMatchDescription] = useState("");
  const [capacity, setCapacity] = useState(event?.maxSignups ? String(event.maxSignups) : "Unlimited");
  const [ticketGoLive, setTicketGoLive] = useState("Immediately");
  const [ticketsUrl, setTicketsUrl] = useState(event?.ticketsUrl || "");
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueNameAr, setNewLeagueNameAr] = useState("");
  const [newLeagueWebsite, setNewLeagueWebsite] = useState("");
  const [newLeagueLogo, setNewLeagueLogo] = useState<string>("");
  const [newLeagueVisible, setNewLeagueVisible] = useState(true);
  const leagueLogoInputRef = useRef<HTMLInputElement>(null);
  const [customLeagues, setCustomLeagues] = useState<string[]>([]);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid image",
        description: "Please select a valid image file.",
        variant: "error",
      });
      return;
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      toastQueue.add({
        title: "File too large",
        description: "Image size must be less than 10MB.",
        variant: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleLeagueLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLeagueLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCreateLeague = () => {
    if (newLeagueName.trim()) {
      setCustomLeagues([...customLeagues, newLeagueName.trim()]);
      setLeague(newLeagueName.trim());
      setShowCreateLeagueModal(false);
      setNewLeagueName("");
      setNewLeagueNameAr("");
      setNewLeagueWebsite("");
      setNewLeagueLogo("");
      setNewLeagueVisible(true);
    }
  };
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamNameAr, setNewTeamNameAr] = useState("");
  const [newTeamLeague, setNewTeamLeague] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("");
  const [newTeamWebsite, setNewTeamWebsite] = useState("");
  const [newTeamStadium, setNewTeamStadium] = useState("");
  const [newTeamStadiumAr, setNewTeamStadiumAr] = useState("");
  const [newTeamManager, setNewTeamManager] = useState("");
  const [newTeamManagerAr, setNewTeamManagerAr] = useState("");
  const [newTeamVisible, setNewTeamVisible] = useState(true);
  const [teamCreateError, setTeamCreateError] = useState<string | null>(null);
  const teamLogoInputRef = useRef<HTMLInputElement>(null);
  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setTeamCreateError("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      setTeamCreateError("Image size must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTeamLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

  useEffect(() => {
    const html = document.documentElement;
    const previousLang = html.lang || "en";
    const previousDir = html.dir || "ltr";

    html.lang = isArabic ? "ar" : "en";
    html.dir = isArabic ? "rtl" : "ltr";

    return () => {
      html.lang = previousLang;
      html.dir = previousDir;
    };
  }, [isArabic]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const fetchedTeamNames = json.data
            .filter((team: { visible?: boolean }) => team.visible !== false)
            .map((team: { name_en?: string }) => team.name_en?.trim())
            .filter((name: string | undefined): name is string => Boolean(name));

          setTeams(Array.from(new Set([...DEFAULT_TEAMS, ...fetchedTeamNames])));
        } else if (json?.code === "TEAMS_TABLE_MISSING") {
          console.warn("Teams table is missing. Showing default teams only.");
        }
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };

    fetchTeams();
  }, []);

  const resetTeamForm = () => {
    setTeamCreateError(null);
    setNewTeamName("");
    setNewTeamNameAr("");
    setNewTeamLeague("");
    setNewTeamLogo("");
    setNewTeamWebsite("");
    setNewTeamStadium("");
    setNewTeamStadiumAr("");
    setNewTeamManager("");
    setNewTeamManagerAr("");
    setNewTeamVisible(true);
  };

  const uploadTeamLogo = async (base64Data: string): Promise<string | null> => {
    if (!base64Data.startsWith("data:")) return base64Data;

    try {
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;

      const mimeType = matches[1];
      const base64Content = matches[2];
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const extension = mimeType.split("/")[1] || "png";
      const file = new File(
        [new Blob([byteArray], { type: mimeType })],
        `team-logo-${Date.now()}.${extension}`,
        { type: mimeType }
      );

      if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
        setTeamCreateError("Image size must be less than 10MB.");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "teams");

      let res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorData: { error?: string } = {};
        try {
          errorData = await res.json();
        } catch {
          errorData = {};
        }

        if (errorData.error?.toLowerCase().includes("invalid form data")) {
          const query = new URLSearchParams({
            folder: "teams",
            fileName: file.name,
          }).toString();

          res = await fetch(`/api/upload?${query}`, {
            method: "POST",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
              "x-file-name": file.name,
            },
            body: file,
          });
        }

        if (!res.ok) {
          const retryErrorData = await res.json().catch(() => ({}));
          console.error("Team logo upload failed:", retryErrorData.error || res.statusText);
          return null;
        }
      }

      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.error("Failed to upload team logo", err);
      return null;
    }
  };

  const handleCreateTeam = async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName || !newTeamLeague) return;

    setIsCreatingTeam(true);
    setTeamCreateError(null);
    try {
      const uploadedLogoUrl = newTeamLogo ? await uploadTeamLogo(newTeamLogo) : null;

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          league: newTeamLeague,
          name_en: trimmedName,
          name_ar: newTeamNameAr.trim(),
          logo_url: uploadedLogoUrl || "",
          website_url: newTeamWebsite.trim(),
          stadium_name: newTeamStadium.trim(),
          stadium_name_ar: newTeamStadiumAr.trim(),
          manager_name: newTeamManager.trim(),
          manager_name_ar: newTeamManagerAr.trim(),
          visible: newTeamVisible,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        if (result?.code === "TEAMS_TABLE_MISSING") {
          setTeamCreateError("Teams backend is not initialized. Please run the teams migration first.");
          return;
        }
        setTeamCreateError(result?.error || "Failed to create team");
        return;
      }

      const createdTeamName = result.data?.name_en || trimmedName;
      if (result.data?.visible !== false) {
        setTeams((prev) => Array.from(new Set([...prev, createdTeamName])));
      }
      setShowCreateTeamModal(false);
      resetTeamForm();
    } catch (err) {
      console.error("Failed to create team", err);
      setTeamCreateError("Failed to create team. Please try again.");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (placesBoxRef.current && !placesBoxRef.current.contains(e.target as Node)) {
        setIsPlacesOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    const q = locationInput.trim();
    if (q.length < 3) {
      setPlacePredictions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(q)}`);
        const data = await res.json();
        const preds = Array.isArray(data?.predictions) ? data.predictions : [];
        setPlacePredictions(
          preds
            .map((p: any) => ({ description: p?.description, place_id: p?.place_id }))
            .filter((p: any) => typeof p.description === "string" && typeof p.place_id === "string")
        );
      } catch {
        setPlacePredictions([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [locationInput]);

  const selectPlace = async (placeId: string, description: string) => {
    setLocationPlaceId(placeId);
    setLocationInput(description);
    setIsPlacesOpen(false);

    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`);
      const data = await res.json();
      const result = data?.result;
      const formatted = result?.formatted_address;
      const lat = result?.geometry?.location?.lat;
      const lng = result?.geometry?.location?.lng;

      if (typeof formatted === "string" && formatted.trim()) {
        setLocationInput(formatted);
      }
      if (typeof lat === "number" && typeof lng === "number") {
        setLocationLatLng({ lat, lng });
      }
    } catch {
      // non-fatal; keep description
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
  const badgeLabel = isMatchEvent ? (league || "League") : chapter;
  const displayTitle = isMatchEvent && homeTeam && awayTeam ? `${homeTeam} Vs ${awayTeam}` : eventTitle;
  const displayType: "Onsite" | "Online" | "Hybrid" = isMatchEvent
    ? (matchLocationType === "virtual" ? "Online" : "Onsite")
    : type;
  const previewLocation = isMatchEvent
    ? (matchLocationType === "onsite" ? stadiumVenueName : livestreamUrl)
    : locationInput;

  return (
    <div
      className={`bg-[#ECEFF2] border border-border rounded-lg p-3 pb-4 flex flex-col gap-4 ${isArabic ? "font-ko-sans-ar" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header: Title + Badges + Check-In Guests */}
      <div className="flex items-center justify-between">
        <div className="hidden md:flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground leading-[18px]">
            {displayTitle}
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 h-5 px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-[10px] font-medium rounded-[4px] leading-none">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
              </svg>
              {badgeLabel}
            </span>
            <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-[10px] font-medium rounded-[4px] leading-none">
              {displayType}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors">
            Check-In Guests
          </button>
          <div className="md:hidden">
            <Menu>
              <MenuButton className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center hover:bg-foreground/90 transition-colors focus:outline-none data-[open]:bg-foreground/90">
                <MoreHorizontal className="w-5 h-5 text-white" />
              </MenuButton>
              <Portal>
                <MenuItems
                  anchor="bottom end"
                  transition
                  className="z-[100] mt-1.5 w-[180px] bg-card border border-border rounded-xl p-1 shadow-lg focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  <MenuItem>
                    <button
                      onClick={() => setShowCloneModal(true)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/70 transition-colors group focus:outline-none"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                      Clone Event
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setShowSlidoModal(true)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-blue-100 dark:bg-blue-950/40 hover:bg-blue-100 dark:bg-blue-950/40 transition-colors text-foreground focus:outline-none"
                    >
                      <Code className="w-4 h-4" />
                      Add Slido Embed
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors group focus:outline-none"
                    >
                      <XCircle className="w-4 h-4 text-destructive" />
                      Cancel Event
                    </button>
                  </MenuItem>
                </MenuItems>
              </Portal>
            </Menu>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="grid grid-cols-4 md:inline-flex items-center gap-1 bg-[#ECEFF2] p-1 rounded-lg w-full md:w-fit self-start">
          {(["overview", "guests", "analytics", "advanced"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`relative h-9 w-full px-2 md:px-4 py-2 rounded-lg text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors z-10 ${detailTab === tab
                ? "text-[#3f52ff] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {detailTab === tab && (
                <motion.div
                  layoutId="eventDetailTabIndicator"
                  className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
        <div className="hidden md:block">
          <Menu>
            <MenuButton className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center hover:bg-foreground/90 transition-colors focus:outline-none data-[open]:bg-foreground/90">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </MenuButton>
            <Portal>
              <MenuItems
                anchor="bottom end"
                transition
                className="z-[100] mt-1.5 w-[180px] bg-card border border-border rounded-xl p-1 shadow-lg focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                <MenuItem>
                  <button
                    onClick={() => setShowCloneModal(true)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/70 transition-colors group focus:outline-none"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    Clone Event
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => setShowSlidoModal(true)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-blue-100 dark:bg-blue-950/40 hover:bg-blue-100 dark:bg-blue-950/40 transition-colors text-foreground focus:outline-none"
                  >
                    <Code className="w-4 h-4" />
                    Add Slido Embed
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors group focus:outline-none"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                    Cancel Event
                  </button>
                </MenuItem>
              </MenuItems>
            </Portal>
          </Menu>
        </div>
      </div>

      {/* Tab Content */}
      {detailTab === "overview" && (
        <div className="flex lg:flex-row flex-col gap-4 items-start">
          {/* Desktop: Event Preview Card */}
          <div className="hidden lg:block">
            <EventPreviewCard
              coverImage={coverImage}
              eventTitle={displayTitle}
              badgeLabel={badgeLabel}
              type={displayType}
              displayMonth={displayMonth}
              displayDay={displayDay}
              startDate={startDate}
              startTime={startTime}
              endTime={endTime}
              locationInput={previewLocation}
              signups={event?.signups || 0}
              maxSignups={event?.maxSignups || 300}
              onEditImage={() => coverImageInputRef.current?.click()}
            />
          </div>

          {/* Right: Event Form */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="flex justify-end">
              <div className="w-[120px]">
                <AriaSelect
                  aria-label="Language"
                  selectedKey={language}
                  onSelectionChange={(key) => setLanguage(key as "English" | "French" | "Arabic")}
                >
                  <AriaSelectItem id="English" textValue="English">English</AriaSelectItem>
                  <AriaSelectItem id="French" textValue="French">French</AriaSelectItem>
                  <AriaSelectItem id="Arabic" textValue="Arabic">Arabic</AriaSelectItem>
                </AriaSelect>
              </div>
            </div>

            {isMatchEvent ? (
              <div className="flex flex-col gap-4">
                {/* Match Setup Section */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                    {t("Match Setup", "إعداد المباراة", "Configuration du match")}
                  </span>

                  {/* League Dropdown */}
                  <div className="bg-card rounded-t-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-base font-medium text-foreground">
                      {t("League", "الدوري", "Ligue")}<span className="text-destructive">*</span>
                    </span>
                    <Menu as="div" className="relative">
                      <MenuButton className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {league || t("Select League", "اختر الدوري", "Sélectionner une ligue")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </MenuButton>
                      <Portal>
                        <MenuItems
                          anchor="bottom end"
                          transition
                          className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[180px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                        >
                          <MenuItem>
                            <button
                              onClick={() => setShowCreateLeagueModal(true)}
                              className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              {t("+ Create League", "+ إنشاء دوري", "+ Créer une ligue")}
                            </button>
                          </MenuItem>
                          {[...customLeagues, "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"].map((l) => (
                            <MenuItem key={l}>
                              <button
                                onClick={() => setLeague(l)}
                                className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${league === l
                                  ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                  : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                  }`}
                              >
                                {l}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Portal>
                    </Menu>
                  </div>

                  {/* Home Team & Away Team */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 min-w-0 bg-card rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-base font-medium text-foreground">
                        {t("Home Team", "الفريق المضيف", "Équipe à domicile")}<span className="text-destructive">*</span>
                      </span>
                      <Menu as="div" className="relative">
                        <MenuButton className="flex items-center gap-1 max-w-[150px] sm:max-w-none">
                          <span className="text-sm font-medium text-muted-foreground truncate">
                            {homeTeam || t("Select Team", "اختر الفريق", "Sélectionner une équipe")}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </MenuButton>
                        <Portal>
                          <MenuItems
                            anchor="bottom end"
                            transition
                            className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[180px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                          >
                            <MenuItem>
                              <button
                                onClick={() => setShowCreateTeamModal(true)}
                                className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                              >
                                {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                              </button>
                            </MenuItem>
                            {teams.map((team) => (
                              <MenuItem key={team}>
                                <button
                                  onClick={() => setHomeTeam(team)}
                                  className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${homeTeam === team
                                    ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                    : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                    }`}
                                >
                                  {team}
                                </button>
                              </MenuItem>
                            ))}
                          </MenuItems>
                        </Portal>
                      </Menu>
                    </div>

                    <div className="flex-1 min-w-0 bg-card rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-base font-medium text-foreground">
                        {t("Away Team", "الفريق الضيف", "Équipe à l'extérieur")}<span className="text-destructive">*</span>
                      </span>
                      <Menu as="div" className="relative">
                        <MenuButton className="flex items-center gap-1 max-w-[150px] sm:max-w-none">
                          <span className="text-sm font-medium text-muted-foreground truncate">
                            {awayTeam || t("Select Team", "اختر الفريق", "Sélectionner une équipe")}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </MenuButton>
                        <Portal>
                          <MenuItems
                            anchor="bottom end"
                            transition
                            className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[180px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                          >
                            <MenuItem>
                              <button
                                onClick={() => setShowCreateTeamModal(true)}
                                className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                              >
                                {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                              </button>
                            </MenuItem>
                            {teams.map((team) => (
                              <MenuItem key={team}>
                                <button
                                  onClick={() => setAwayTeam(team)}
                                  className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${awayTeam === team
                                    ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                    : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                    }`}
                                >
                                  {team}
                                </button>
                              </MenuItem>
                            ))}
                          </MenuItems>
                        </Portal>
                      </Menu>
                    </div>
                  </div>
                </div>

                {/* Date/Time Section */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-card rounded-lg p-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 flex flex-col items-center justify-center px-1">
                          <div className="w-[10px] h-[10px] bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full" />
                        </div>
                        <span className="text-sm font-normal text-foreground">
                          {t("Start", "البداية", "Début")}
                        </span>
                      </div>
                      <div className="flex gap-[2px] items-center w-full sm:w-auto">
                        <div className="w-full sm:w-[136px]">
                          <AriaDatePicker
                            value={startDate}
                            onChange={setStartDate}
                            groupClassName="bg-blue-100 dark:bg-blue-950/40 border-transparent h-9 px-3"
                            inputClassName="text-base font-normal text-foreground justify-center"
                            showButton={false}
                          />
                        </div>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-blue-100 dark:bg-blue-950/40 h-9 px-3 py-2 rounded-lg text-base font-normal text-foreground w-full sm:w-[70px] text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="ml-[13px] h-4 border-l-[1.5px] border-dashed border-[#3f52ff]" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 flex flex-col items-center justify-center px-1">
                          <div className="w-[10px] h-[10px] border border-[#3f52ff] rounded-full" />
                        </div>
                        <span className="text-sm font-normal text-foreground">
                          {t("End", "النهاية", "Fin")}
                        </span>
                      </div>
                      <div className="flex gap-[2px] items-center w-full sm:w-auto">
                        <div className="w-full sm:w-[136px]">
                          <AriaDatePicker
                            value={endDate}
                            onChange={setEndDate}
                            groupClassName="bg-blue-100 dark:bg-blue-950/40 border-transparent h-9 px-3"
                            inputClassName="text-base font-normal text-foreground justify-center"
                            showButton={false}
                          />
                        </div>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="bg-blue-100 dark:bg-blue-950/40 h-9 px-3 py-2 rounded-lg text-base font-normal text-foreground w-full sm:w-[70px] text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0">
                    <Globe className="w-4 h-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">GMT+01:00</span>
                    <span className="text-xs font-normal text-muted-foreground">Algiers</span>
                  </div>
                </div>

                {/* Line-Up Announcement Settings */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                    {t("Line-Up Announcement Settings", "إعدادات إعلان التشكيلة", "Paramètres d'annonce de composition")}
                  </span>
                  <div className="bg-card rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                      onClick={() => setEnableLineUpAnnouncement(!enableLineUpAnnouncement)}
                      className={`w-4 h-4 border rounded shrink-0 flex items-center justify-center ${enableLineUpAnnouncement
                        ? "bg-[#3f52ff] dark:bg-[#3f52ff] border-[#3f52ff]"
                        : "bg-card border-border"
                        }`}
                    >
                      {enableLineUpAnnouncement && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="text-base font-medium text-foreground flex-1">
                      {t("Enable Line-Up Announcement", "تفعيل إعلان التشكيلة", "Activer l'annonce de composition")}
                    </span>

                    {enableLineUpAnnouncement && (
                      <Menu as="div" className="relative self-end sm:self-auto">
                        <MenuButton className="flex items-center gap-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {translateLineupTime(lineUpAnnouncementTime)}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </MenuButton>
                        <Portal>
                          <MenuItems
                            anchor="bottom end"
                            transition
                            className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[200px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                          >
                            {lineupOptions.map((time) => (
                              <MenuItem key={time}>
                                <button
                                  onClick={() => setLineUpAnnouncementTime(time)}
                                  className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${lineUpAnnouncementTime === time
                                    ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                    : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                    }`}
                                >
                                  {translateLineupTime(time)}
                                </button>
                              </MenuItem>
                            ))}
                          </MenuItems>
                        </Portal>
                      </Menu>
                    )}
                  </div>

                  {enableLineUpAnnouncement && (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            {t("Home Team Lineup", "تشكيلة الفريق المضيف", "Composition de l'équipe à domicile")}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("Optional", "اختياري", "Optionnel")}
                          </span>
                        </div>
                        <textarea
                          placeholder={t(
                            "Enter lineup for home team (eg. player names, numbers, positions)",
                            "أدخل تشكيلة الفريق (مثل الأسماء والأرقام والمراكز)",
                            "Entrez la composition (ex. noms, numéros, postes)"
                          )}
                          value={homeTeamLineup}
                          onChange={(e) => setHomeTeamLineup(e.target.value)}
                          className="w-full h-[74px] px-3 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            {t("Away Team Lineup", "تشكيلة الفريق الضيف", "Composition de l'équipe extérieure")}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {t("Optional", "اختياري", "Optionnel")}
                          </span>
                        </div>
                        <textarea
                          placeholder={t(
                            "Enter lineup for home team (eg. player names, numbers, positions)",
                            "أدخل تشكيلة الفريق (مثل الأسماء والأرقام والمراكز)",
                            "Entrez la composition (ex. noms, numéros, postes)"
                          )}
                          value={awayTeamLineup}
                          onChange={(e) => setAwayTeamLineup(e.target.value)}
                          className="w-full h-[74px] px-3 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Match Location */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                    {t("Match Location", "موقع المباراة", "Lieu du match")}
                  </span>

                  <div className="flex items-center bg-[#D5DDE2] rounded-lg p-[6px] w-full">
                    <button
                      onClick={() => setMatchLocationType("onsite")}
                      className={`relative flex-1 h-[36px] px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${matchLocationType === "onsite"
                        ? "text-[#3f52ff] dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {matchLocationType === "onsite" && (
                        <motion.div
                          layoutId="matchLocationTypeIndicator"
                          className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.12)]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 w-full text-center">
                        {t("On site", "حضوري", "Sur site")}
                      </span>
                    </button>
                    <button
                      onClick={() => setMatchLocationType("virtual")}
                      className={`relative flex-1 h-[36px] px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${matchLocationType === "virtual"
                        ? "text-[#3f52ff] dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {matchLocationType === "virtual" && (
                        <motion.div
                          layoutId="matchLocationTypeIndicator"
                          className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.12)]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 w-full text-center">
                        {t("Virtual", "افتراضي", "Virtuel")}
                      </span>
                    </button>
                  </div>

                  {matchLocationType === "onsite" ? (
                    <div className="bg-card rounded-lg p-3 flex flex-col gap-3">
                      <span className="text-base font-medium text-foreground">
                        {t("Stadium/Venue Name", "اسم الملعب/المكان", "Nom du stade/lieu")}
                      </span>
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <input
                            type="text"
                            placeholder={t("Enter stadium/venue name", "أدخل اسم الملعب/المكان", "Entrez le nom du stade/lieu")}
                            value={stadiumVenueName}
                            onChange={(e) => setStadiumVenueName(e.target.value)}
                            className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-foreground">
                              {t("Location Masking", "إخفاء الموقع", "Masquage du lieu")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t("Hide real location and show custom name", "إخفاء الموقع الحقيقي وإظهار اسم مخصص", "Masquer le lieu réel et afficher un nom personnalisé")}
                            </span>
                          </div>
                          <button
                            onClick={() => setMatchLocationMasking(!matchLocationMasking)}
                            className={`relative w-[42px] h-[24px] rounded-full transition-colors ${matchLocationMasking ? "bg-[#3f52ff] dark:bg-[#3f52ff]" : "bg-muted"
                              }`}
                          >
                            <div
                              className={`absolute top-1 w-[16px] h-[16px] bg-card rounded-full shadow transition-all ${matchLocationMasking ? "left-[22px]" : "left-1"
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg p-3 flex flex-col gap-3">
                      <span className="text-base font-medium text-foreground">
                        {t("Livestream URL", "رابط البث المباشر", "URL de diffusion")}
                      </span>
                      <div className="relative">
                        <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                          <Link className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="url"
                          placeholder={t("Enter the location URL", "أدخل رابط الموقع", "Entrez l'URL du lieu")}
                          value={livestreamUrl}
                          onChange={(e) => setLivestreamUrl(e.target.value)}
                          className={`w-full h-9 ${isArabic ? "pr-10 pl-10 text-right" : "pl-10 pr-10"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Description */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                      {t("Match Description", "وصف المباراة", "Description du match")}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("Optional", "اختياري", "Optionnel")}
                    </span>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
                    <textarea
                      placeholder={t("Placeholder", "اكتب وصفاً", "Saisir une description")}
                      value={matchDescription}
                      onChange={(e) => setMatchDescription(e.target.value)}
                      maxLength={280}
                      className="w-full h-[100px] text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white bg-[#3f52ff] dark:bg-[#3f52ff] px-2 py-0.5 rounded">
                        {matchDescription.length}/280 {t("characters", "حرفًا", "caractères")}
                      </span>
                      <button className="text-muted-foreground hover:text-muted-foreground">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.333 8.667V12.667C13.333 13.0203 13.1927 13.3594 12.9426 13.6095C12.6925 13.8595 12.3536 14 12 14H3.333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.667V4C2 3.64638 2.14048 3.30724 2.39052 3.05719C2.64057 2.80714 2.97971 2.667 3.333 2.667H7.333" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M11.333 1.333L14.666 4.666L8 11.333H4.667V8L11.333 1.333Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                    {t("Additional Options", "خيارات إضافية", "Options supplémentaires")}
                  </span>
                  <div className="bg-card rounded-lg overflow-hidden">
                    <Menu as="div" className="relative border-b border-border">
                      <MenuButton className="w-full px-3 py-2 flex items-center gap-2 hover:bg-background transition-colors">
                        <Users className="w-4 h-4 text-foreground" />
                        <span className={`text-base font-medium text-foreground flex-1 ${isArabic ? "text-right" : "text-left"}`}>
                          {t("Capacity", "السعة", "Capacité")}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-muted-foreground">{capacity}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </MenuButton>
                      <Portal>
                        <MenuItems
                          anchor="bottom end"
                          transition
                          className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[160px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                        >
                          {["Unlimited", "50", "100", "200", "300", "500", "1000"].map((option) => (
                            <MenuItem key={option}>
                              <button
                                onClick={() => setCapacity(option)}
                                className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${capacity === option
                                  ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                  : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                  }`}
                              >
                                {option}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Portal>
                    </Menu>

                    <Menu as="div" className="relative">
                      <MenuButton className="w-full px-3 py-2 flex items-center gap-2 hover:bg-background transition-colors">
                        <Ticket className="w-4 h-4 text-foreground" />
                        <span className={`text-base font-medium text-foreground flex-1 ${isArabic ? "text-right" : "text-left"}`}>
                          {t("When tickets should go live?", "متى يجب تفعيل بيع التذاكر؟", "Quand les billets doivent-ils être en vente ?")}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {translateTicketGoLive(ticketGoLive === "Custom Date" ? "Immediately" : ticketGoLive)}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </MenuButton>
                      <Portal>
                        <MenuItems
                          anchor="bottom end"
                          transition
                          className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[180px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                        >
                          {ticketGoLiveOptions.map((option) => (
                            <MenuItem key={option}>
                              <button
                                onClick={() => setTicketGoLive(option)}
                                className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${ticketGoLive === option
                                  ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                  : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                  }`}
                              >
                                {translateTicketGoLive(option)}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Portal>
                    </Menu>
                  </div>
                </div>

                {/* Tickets URL */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {t("Tickets URL", "رابط التذاكر", "URL des billets")}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("Optional", "اختياري", "Optionnel")}
                    </span>
                  </div>
                  <div className="relative">
                    <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="url"
                      placeholder={t("https://ticketing-url.com", "https://ticketing-url.com", "https://ticketing-url.com")}
                      value={ticketsUrl}
                      onChange={(e) => setTicketsUrl(e.target.value)}
                      className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-normal">
                      {t("External ticketing link for fans to purchase tickets", "رابط خارجي لشراء التذاكر", "Lien externe pour acheter des billets")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="text-[40px] font-bold text-[#3f52ff] dark:text-white leading-[46px] bg-transparent outline-none w-full"
              placeholder="Event Title"
            />

            {/* Start / End Date-Time Input */}
            <div className="flex sm:flex-row flex-col gap-2 items-start">
              <div className="flex-1 bg-card rounded-lg p-2.5 flex flex-col gap-4 w-full">
                {/* Start Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[42px] border border-border rounded-[8px] flex flex-col items-center overflow-hidden bg-card shrink-0">
                      <div className="bg-[#859BAB] w-full h-[14px] flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-bold leading-none uppercase tracking-tight">{displayMonth}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[16px] font-medium text-muted-foreground leading-none">{displayDay}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">Start</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-[136px]">
                      <AriaDatePicker value={startDate} onChange={setStartDate} />
                    </div>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-blue-100 dark:bg-blue-950/40 rounded-lg px-2 py-2 text-base font-normal text-foreground w-[60px] text-center outline-none"
                    />
                  </div>
                </div>

                {/* Divider / Line between */}
                <div className="ml-5 h-px bg-border -my-2" />

                {/* End Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[42px] border border-border rounded-[8px] flex flex-col items-center overflow-hidden bg-card shrink-0 opacity-60">
                      <div className="bg-[#859BAB] w-full h-[14px] flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-bold leading-none uppercase tracking-tight">
                          {getDayAndMonth(endDate).month}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        <span className="text-[16px] font-medium text-muted-foreground leading-none">
                          {getDayAndMonth(endDate).day}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">End</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-[136px]">
                      <AriaDatePicker value={endDate} onChange={setEndDate} />
                    </div>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-blue-100 dark:bg-blue-950/40 rounded-lg px-2 py-2 text-base font-normal text-foreground w-[60px] text-center outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0">
                <Globe className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">GMT+01:00</span>
                <span className="text-xs font-normal text-muted-foreground">Algiers</span>
              </div>
            </div>

            <div className="bg-card rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-foreground" />
                <span className="text-base font-medium text-foreground">Duration</span>
              </div>
              <span className="text-base font-medium text-muted-foreground">3 hours</span>
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
              <span className="text-sm font-medium text-[#3f52ff] dark:text-white">Event Location</span>
              <div className="bg-card rounded-lg p-3 flex flex-col gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-foreground mt-0.5" />
                  <span className="text-base font-medium text-foreground">Add event location</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">Location Name</label>
                  <div className="relative" ref={placesBoxRef}>
                    <input
                      type="text"
                      placeholder="Search places"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setLocationPlaceId(null);
                        setLocationLatLng(null);
                        setIsPlacesOpen(true);
                      }}
                      onFocus={() => setIsPlacesOpen(true)}
                      className="h-9 px-3 border border-border rounded-lg text-sm text-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] w-full"
                    />
                    {isPlacesOpen && placePredictions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                        {placePredictions.slice(0, 6).map((p) => (
                          <button
                            key={p.place_id}
                            type="button"
                            onClick={() => selectPlace(p.place_id, p.description)}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                          >
                            {p.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-muted">
                  <Image src="/img/map-placeholder.jpg" alt="Map" fill className="object-cover" />
                </div>

                {/* Geo-Fence Radius */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
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
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Location Masking</span>
                    <span className="text-xs text-muted-foreground">Hide real location and show custom name</span>
                  </div>
                  <button
                    onClick={() => setLocationMasking(!locationMasking)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${locationMasking ? "bg-[#3f52ff] dark:bg-[#3f52ff]" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card transition-transform ${locationMasking ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#3f52ff] dark:text-white">Description</span>
              <div className="border border-border rounded-lg p-3 flex flex-col gap-2 h-[149px] bg-card">
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  maxLength={280}
                  className="flex-1 text-sm font-normal text-foreground resize-none outline-none"
                />
                <div className="flex justify-end">
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    {eventDescription.length}/280
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile: Event Preview Card (above CTA) */}
            <div className="lg:hidden mt-4">
              <EventPreviewCard
                coverImage={coverImage}
                eventTitle={displayTitle}
                badgeLabel={badgeLabel}
                type={displayType}
                displayMonth={displayMonth}
                displayDay={displayDay}
                startDate={startDate}
                startTime={startTime}
                endTime={endTime}
                locationInput={previewLocation}
                signups={event?.signups || 0}
                maxSignups={event?.maxSignups || 300}
                onEditImage={() => coverImageInputRef.current?.click()}
              />
            </div>

            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
            />

            <button
              disabled={isSaving}
              onClick={() => {
                const dateIsoString = startDate?.toString() || null;
                const resolvedTitle = isMatchEvent && homeTeam && awayTeam ? `${homeTeam} Vs ${awayTeam}` : eventTitle;
                const resolvedLocation = isMatchEvent
                  ? (matchLocationType === "onsite" ? stadiumVenueName : livestreamUrl)
                  : locationInput;
                const resolvedType: "Onsite" | "Online" | "Hybrid" = isMatchEvent
                  ? (matchLocationType === "virtual" ? "Online" : "Onsite")
                  : type;
                const resolvedMaxSignups = isMatchEvent
                  ? (capacity === "Unlimited" ? 9999 : parseInt(capacity) || (event?.maxSignups || 300))
                  : (event?.maxSignups || 300);
                const savedEvent: EventItem = {
                  id: event?.id || crypto.randomUUID(),
                  title: resolvedTitle,
                  coverImage,
                  chapter,
                  league: isMatchEvent ? league : "",
                  homeTeam: isMatchEvent ? homeTeam : "",
                  awayTeam: isMatchEvent ? awayTeam : "",
                  enableLineUpAnnouncement: isMatchEvent ? enableLineUpAnnouncement : false,
                  lineUpAnnouncementTime: isMatchEvent ? lineUpAnnouncementTime : undefined,
                  homeTeamLineup: isMatchEvent ? homeTeamLineup : "",
                  awayTeamLineup: isMatchEvent ? awayTeamLineup : "",
                  livestreamUrl: isMatchEvent ? livestreamUrl : "",
                  stadiumVenueName: isMatchEvent ? stadiumVenueName : "",
                  ticketsUrl: isMatchEvent ? ticketsUrl : "",
                  type: resolvedType,
                  eventCategory: event?.eventCategory || "general",
                  location: resolvedLocation,
                  signups: event?.signups || 0,
                  maxSignups: resolvedMaxSignups,
                  dateGroup: startDate
                    ? new Date(startDate.year, startDate.month - 1, startDate.day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "No Date",
                  date: dateIsoString || undefined,
                  dateIso: dateIsoString || undefined,
                };
                onSave(savedEvent);
              }}
              className="w-full min-h-[40px] bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          {/* Stats Row - unified border container */}
          <div className="grid grid-cols-2 md:flex md:items-stretch border border-border rounded-xl bg-card overflow-hidden">
            {/* Registered Guests */}
            <div className="flex-1 flex items-center justify-between p-4 border-r border-border border-b md:border-b-0 md:border-r">
              <div className="flex items-center gap-2">
                <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Registered Guests</span>
                  <span className="text-xs font-normal text-muted-foreground leading-[18px]">Capacity limit</span>
                </div>
              </div>
              <span className="text-base font-semibold text-foreground leading-[18px]">42 / 50</span>
            </div>

            {/* Checked In */}
            <div className="flex-1 flex items-center justify-between p-4 border-b border-border md:border-b-0 md:border-r">
              <div className="flex items-center gap-2">
                <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Checked In</span>
                  <span className="text-xs font-normal text-muted-foreground leading-[18px]">0% of registered</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-foreground leading-[18px]">0</span>
            </div>

            {/* Checked Out */}
            <div className="flex-1 flex items-center justify-between p-4 border-r border-border md:border-r">
              <div className="flex items-center gap-2">
                <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Checked Out</span>
                  <span className="text-xs font-normal text-muted-foreground leading-[18px]">0% of checked in</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-foreground leading-[18px]">0</span>
            </div>

            {/* Booked */}
            <div className="flex-1 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Booked</span>
                  <span className="text-xs font-normal text-muted-foreground leading-[18px]">Checked-in</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-foreground leading-[18px]">2</span>
            </div>
          </div>


          {/* Guest List Container */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            {/* Guest List Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">Guest List</h3>
                <span className="text-sm text-muted-foreground">All registered guests for this event</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
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
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.66699 5.83301L7.00033 8.16634L9.33366 5.83301" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 8.16634V1.74967" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Export CSV
                  {selectedGuests.size > 0 && (
                    <span className="bg-card text-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {selectedGuests.size}
                    </span>
                  )}
                </button>
                <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors">
                  Add User
                </button>
              </div>
            </div>

            {/* Search + Filter Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="md:hidden flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    if (selectedGuests.size === 0) return;
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
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.66699 5.83301L7.00033 8.16634L9.33366 5.83301" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 8.16634V1.74967" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Export CSV
                </button>
                <button className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors">
                  Add User
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg w-full md:w-[373px]">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search Name, Email"
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                    className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none p-0 focus:ring-0"
                  />
                  <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">⌘K</span>
                </div>
                <div className="hidden md:block">
                  <Menu>
                    <MenuButton className="flex items-center gap-1.5 px-3 py-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white rounded-lg text-sm font-medium hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors">
                      <Filter className="w-4 h-4" />
                      {guestStatusFilter !== "all" && (
                        <span className="bg-card text-[#3f52ff] dark:text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          1
                        </span>
                      )}
                    </MenuButton>
                    <Portal>
                      <MenuItems
                        anchor="bottom end"
                        transition
                        className="z-[100] mt-1 bg-card border border-border rounded-xl p-1 shadow-lg w-[160px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                      >
                        <MenuItem>
                          <button
                            onClick={() => setGuestStatusFilter("all")}
                            className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
                          >
                            All Guests
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setGuestStatusFilter("checked-in")}
                            className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
                          >
                            Checked In
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setGuestStatusFilter("not-checked-in")}
                            className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
                          >
                            Not Checked In
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setGuestStatusFilter("booked")}
                            className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
                          >
                            Booked
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setGuestStatusFilter("cancelled")}
                            className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
                          >
                            Cancelled
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Portal>
                  </Menu>
                </div>
              </div>
            </div>

            {/* Guest Table */}
            <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 hide-scrollbar">
              <table className="w-full min-w-[720px] table-auto">
                <colgroup>
                  <col className="w-[40px]" />
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="bg-[#ECEFF2]">
                  <tr className="[&>th]:bg-[#ECEFF2] [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
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
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        Name
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        Email
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        Registration Time
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        Ticket ID
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        Ticket QR
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground">
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
                        className={`border-b border-border last:border-b-0 transition-colors ${isSelected ? "bg-blue-100 dark:bg-blue-950/40" : "hover:bg-background"}`}
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
                          <span className="text-sm font-medium text-foreground">
                            {guest.name}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-muted-foreground">
                            {guest.email}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-muted-foreground">
                            {guest.registrationTime}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-foreground">
                            {guest.ticketId}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-card border border-border rounded-md text-xs font-medium text-muted-foreground hover:bg-background transition-colors">
                            <svg className="text-muted-foreground" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1" />
                              <rect x="3.5" y="3.5" width="2.5" height="2.5" fill="currentColor" />
                              <rect x="8" y="3.5" width="2.5" height="2.5" fill="currentColor" />
                              <rect x="3.5" y="8" width="2.5" height="2.5" fill="currentColor" />
                              <rect x="8" y="8" width="2.5" height="2.5" fill="currentColor" />
                            </svg>
                            View QR
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          {(() => {
                            const isPositive = guest.status === "checked-in" || guest.status === "booked";
                            const isWarning = guest.status === "not-checked-in";
                            const label =
                              guest.status === "checked-in"
                                ? "Checked-In"
                                : guest.status === "not-checked-in"
                                  ? "Not Checked-In"
                                  : guest.status === "booked"
                                    ? "Booked"
                                    : "Cancelled";
                            return (
                              <span className="inline-flex items-center gap-2 bg-card border border-[#D5DDE2] rounded-[8px] px-3 py-1 text-sm font-medium text-foreground">
                                {isPositive ? (
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                    <path d="M1.39553 4.96011C1.28658 4.46715 1.30372 3.95468 1.44538 3.4701C1.58703 2.98553 1.84862 2.54451 2.20594 2.18786C2.56326 1.83121 3.00476 1.57044 3.4896 1.42969C3.97443 1.28893 4.48694 1.27274 4.97969 1.38261C5.25105 0.958695 5.62471 0.609869 6.06625 0.368254C6.50779 0.126639 7.00303 0 7.50636 0C8.00969 0 8.50492 0.126639 8.94647 0.368254C9.38801 0.609869 9.76167 0.958695 10.033 1.38261C10.5266 1.27149 11.0403 1.28708 11.5262 1.42792C12.0121 1.56875 12.4545 1.83026 12.8122 2.18809C13.1698 2.54591 13.4311 2.98842 13.5717 3.47442C13.7124 3.96041 13.7277 4.47409 13.6164 4.96761C14.0408 5.23885 14.3901 5.6126 14.6321 6.0544C14.8741 6.49619 15.0009 6.9918 15.0009 7.49552C15.0009 7.99925 14.8741 8.49486 14.6321 8.93665C14.3901 9.37844 14.0408 9.7522 13.6164 10.0234C13.7267 10.5161 13.7109 11.0286 13.5705 11.5135C13.4301 11.9984 13.1696 12.44 12.8132 12.7975C12.4567 13.155 12.0158 13.4167 11.5313 13.5585C11.0467 13.7002 10.5343 13.7174 10.0414 13.6084C9.77039 14.0342 9.39641 14.3846 8.95403 14.6275C8.51165 14.8703 8.01516 14.9976 7.51053 14.9976C7.00589 14.9976 6.5094 14.8703 6.06702 14.6275C5.62464 14.3846 5.25066 14.0342 4.97969 13.6084C4.48687 13.7191 3.97409 13.7034 3.48893 13.5629C3.00378 13.4224 2.56198 13.1616 2.20454 12.8048C1.84709 12.4479 1.5856 12.0066 1.44431 11.5216C1.30302 11.0367 1.28653 10.5239 1.39636 10.0309C0.968646 9.76041 0.616321 9.38608 0.372176 8.94278C0.12803 8.49947 0 8.00161 0 7.49552C0 6.98944 0.12803 6.49158 0.372176 6.04827C0.616321 5.60497 0.968646 5.23064 1.39636 4.96011H1.39553Z" fill="#10A949" />
                                    <path d="M10.4327 5.24399C10.589 5.40026 10.6767 5.61219 10.6767 5.83316C10.6767 6.05413 10.589 6.26605 10.4327 6.42232L7.09941 9.75565C6.94313 9.91188 6.73121 9.99964 6.51024 9.99964C6.28927 9.99964 6.07735 9.91188 5.92107 9.75565L4.25441 8.08899C4.17482 8.01212 4.11133 7.92016 4.06766 7.81849C4.02398 7.71682 4.00099 7.60747 4.00003 7.49682C3.99907 7.38617 4.02015 7.27644 4.06206 7.17403C4.10396 7.07161 4.16583 6.97857 4.24408 6.90033C4.32232 6.82208 4.41536 6.7602 4.51778 6.7183C4.62019 6.6764 4.72992 6.65532 4.84057 6.65628C4.95122 6.65724 5.06057 6.68023 5.16224 6.7239C5.26391 6.76758 5.35587 6.83106 5.43274 6.91066L6.51024 7.98816L9.25441 5.24399C9.41068 5.08776 9.6226 5 9.84357 5C10.0645 5 10.2765 5.08776 10.4327 5.24399Z" fill="white" />
                                  </svg>
                                ) : isWarning ? (
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                    <path d="M14.4866 12L9.15329 2.66665C9.037 2.46146 8.86836 2.29078 8.66457 2.17203C8.46078 2.05329 8.22915 1.99072 7.99329 1.99072C7.75743 1.99072 7.52579 2.05329 7.322 2.17203C7.11822 2.29078 6.94958 2.46146 6.83329 2.66665L1.49995 12C1.38241 12.2036 1.32077 12.4346 1.32129 12.6697C1.32181 12.9047 1.38447 13.1355 1.50292 13.3385C1.62136 13.5416 1.79138 13.7097 1.99575 13.8259C2.20011 13.942 2.43156 14.0021 2.66662 14H13.3333C13.5672 13.9997 13.797 13.938 13.9995 13.8208C14.202 13.7037 14.3701 13.5354 14.487 13.3327C14.6038 13.1301 14.6653 12.9002 14.6653 12.6663C14.6652 12.4324 14.6036 12.2026 14.4866 12Z" fill="#FE9A00" />
                                    <path d="M8 6V8.66667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 11.3333H8.00667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                    <path d="M2.56667 5.74669C2.46937 5.30837 2.48431 4.85259 2.61011 4.42158C2.73591 3.99058 2.9685 3.59832 3.28632 3.28117C3.60413 2.96402 3.99688 2.73225 4.42814 2.60735C4.85941 2.48245 5.31523 2.46847 5.75334 2.56669C5.99448 2.18956 6.32668 1.8792 6.71931 1.66421C7.11194 1.44923 7.55237 1.33655 8.00001 1.33655C8.44764 1.33655 8.88807 1.44923 9.28071 1.66421C9.67334 1.8792 10.0055 2.18956 10.2467 2.56669C10.6855 2.46804 11.1421 2.48196 11.574 2.60717C12.006 2.73237 12.3992 2.96478 12.7172 3.28279C13.0352 3.6008 13.2677 3.99407 13.3929 4.42603C13.5181 4.85798 13.532 5.31458 13.4333 5.75336C13.8105 5.9945 14.1208 6.32669 14.3358 6.71933C14.5508 7.11196 14.6635 7.55239 14.6635 8.00002C14.6635 8.44766 14.5508 8.88809 14.3358 9.28072C14.1208 9.67336 13.8105 10.0056 13.4333 10.2467C13.5316 10.6848 13.5176 11.1406 13.3927 11.5719C13.2678 12.0032 13.036 12.3959 12.7189 12.7137C12.4017 13.0315 12.0094 13.2641 11.5784 13.3899C11.1474 13.5157 10.6917 13.5307 10.2533 13.4334C10.0125 13.8119 9.68006 14.1236 9.28676 14.3396C8.89346 14.5555 8.45202 14.6687 8.00334 14.6687C7.55466 14.6687 7.11322 14.5555 6.71992 14.3396C6.32662 14.1236 5.99417 13.8119 5.75334 13.4334C5.31523 13.5316 4.85941 13.5176 4.42814 13.3927C3.99688 13.2678 3.60413 13.036 3.28632 12.7189C2.9685 12.4017 2.73591 12.0095 2.61011 11.5785C2.48431 11.1475 2.46937 10.6917 2.56667 10.2534C2.18664 10.0129 1.87362 9.68014 1.65671 9.28617C1.4398 8.8922 1.32605 8.44976 1.32605 8.00002C1.32605 7.55029 1.4398 7.10785 1.65671 6.71388C1.87362 6.31991 2.18664 5.9872 2.56667 5.74669Z" fill="#E22023" />
                                    <path d="M8 10.6667V8" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 5.33331H8.00667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                                {label}
                              </span>
                            );
                          })()}
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
                className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-card text-muted-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{guestPage}</span> of <span className="text-[#3f52ff] dark:text-white">{totalGuestPages}</span>
              </span>
              <button
                onClick={() => setGuestPage(p => Math.min(totalGuestPages, p + 1))}
                disabled={guestPage >= totalGuestPages}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-card text-muted-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Create League Modal */}
      {showCreateLeagueModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[220]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-black/20"
            onClick={() => setShowCreateLeagueModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative z-10 bg-card border border-border rounded-xl w-[493px] flex flex-col ${isArabic ? "font-ko-sans-ar" : ""}`}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="bg-card border-b border-border rounded-t-xl px-4 pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-[25.2px]">
                    {t("Create League", "إنشاء دوري", "Créer une ligue")}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground leading-[18px]">
                    {t(
                      "Enter the league details below to create a new league.",
                      "أدخل تفاصيل الدوري أدناه لإنشاء دوري جديد.",
                      "Entrez les détails de la ligue ci-dessous pour en créer une."
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateLeagueModal(false)}
                  className="w-[26px] h-[26px] bg-muted rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label htmlFor="league-name-en-edit" className="text-sm font-semibold text-foreground">
                    League Name (English)
                  </label>
                  <input
                    id="league-name-en-edit"
                    type="text"
                    placeholder={t("Enter league name", "أدخل اسم الدوري", "Entrez le nom de la ligue")}
                    value={newLeagueName}
                    onChange={(e) => setNewLeagueName(e.target.value)}
                    className={`w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] ${isArabic ? "text-right font-ko-sans-ar" : ""}`}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label htmlFor="league-name-ar-edit" className="text-sm font-semibold text-foreground text-right font-ko-sans-ar">
                    اسم الدوري (العربية)
                  </label>
                  <input
                    id="league-name-ar-edit"
                    type="text"
                    placeholder="أدخل اسم الدوري"
                    dir="rtl"
                    value={newLeagueNameAr}
                    onChange={(e) => setNewLeagueNameAr(e.target.value)}
                    className="w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {t("League Logo", "شعار الدوري", "Logo de la ligue")}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => leagueLogoInputRef.current?.click()}
                    className="w-20 h-20 border border-black/10 rounded-lg flex items-center justify-center bg-card hover:bg-background transition-colors overflow-hidden"
                  >
                    {newLeagueLogo ? (
                      <img src={newLeagueLogo} alt="League logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={leagueLogoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLeagueLogoUpload}
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-muted-foreground">
                      {t("Upload league logo", "تحميل شعار الدوري", "Télécharger le logo")}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("Recommended: 400x400px", "مقاس موصى به: 400×400", "Recommandé : 400x400")}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://league-website.com"
                    value={newLeagueWebsite}
                    onChange={(e) => setNewLeagueWebsite(e.target.value)}
                    className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewLeagueVisible(!newLeagueVisible)}
                  className={`w-4 h-4 rounded shrink-0 flex items-center justify-center shadow-sm ${newLeagueVisible
                    ? "bg-[#3f52ff] dark:bg-[#3f52ff]"
                    : "bg-card border border-border"
                    }`}
                >
                  {newLeagueVisible && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-foreground">
                  {t("Visible in league selection", "مرئي في اختيار الدوري", "Visible dans la sélection de ligue")}
                </span>
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateLeagueModal(false)}
                className="h-9 px-4 bg-muted text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                {t("Dismiss", "إغلاق", "Fermer")}
              </button>
              <button
                onClick={handleCreateLeague}
                disabled={!newLeagueName.trim()}
                className="h-9 px-4 bg-[#3f52ff] dark:bg-[#3f52ff] text-sm font-medium text-white rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Create League", "إنشاء دوري", "Créer une ligue")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[220]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-black/20"
            onClick={() => setShowCreateTeamModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative z-10 bg-card border border-border rounded-xl w-[493px] flex flex-col ${isArabic ? "font-ko-sans-ar" : ""}`}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="bg-card border-b border-border rounded-t-xl px-4 pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-[25.2px]">
                    {t("Create Team", "إنشاء فريق", "Créer une équipe")}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground leading-[18px]">
                    {t(
                      "Add a new team to the league.",
                      "أضف فريقاً جديداً للدوري.",
                      "Ajouter une nouvelle équipe à la ligue."
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="w-[26px] h-[26px] bg-muted rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  {t("League", "الدوري", "Ligue")}<span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newTeamLeague}
                    onChange={(e) => setNewTeamLeague(e.target.value)}
                    className={`w-full h-9 px-3 ${isArabic ? "pl-8 text-right" : "pr-8"} border border-border rounded-lg text-sm text-foreground bg-background outline-none focus:border-[#3f52ff] appearance-none`}
                  >
                    <option value="" disabled>{t("Select a league", "اختر دوري", "Sélectionner une ligue")}</option>
                    {[...customLeagues, "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <div className={`absolute ${isArabic ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 pointer-events-none`}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Team Name (English)
                  </label>
                  <input
                    type="text"
                    placeholder={t("Enter team name", "أدخل اسم الفريق", "Entrez le nom de l'équipe")}
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className={`w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] ${isArabic ? "text-right font-ko-sans-ar" : ""}`}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground text-right font-ko-sans-ar">
                    اسم الفريق (العربية)
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل اسم الفريق"
                    dir="rtl"
                    value={newTeamNameAr}
                    onChange={(e) => setNewTeamNameAr(e.target.value)}
                    className="w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {t("Team Logo", "شعار الفريق", "Logo de l'équipe")}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => teamLogoInputRef.current?.click()}
                    className="w-20 h-20 border border-black/10 rounded-lg flex items-center justify-center bg-card hover:bg-background transition-colors overflow-hidden"
                  >
                    {newTeamLogo ? (
                      <img src={newTeamLogo} alt="Team logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={teamLogoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleTeamLogoUpload}
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-muted-foreground">
                      {t("Upload team logo", "تحميل شعار الفريق", "Télécharger le logo")}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("Recommended: 400x400px", "مقاس موصى به: 400×400", "Recommandé : 400x400")}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://team-website.com"
                    value={newTeamWebsite}
                    onChange={(e) => setNewTeamWebsite(e.target.value)}
                    className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right" : "pl-10 pr-3"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewTeamVisible(!newTeamVisible)}
                  className={`w-4 h-4 rounded shrink-0 flex items-center justify-center shadow-sm ${newTeamVisible
                    ? "bg-[#3f52ff] dark:bg-[#3f52ff]"
                    : "bg-card border border-border"
                    }`}
                >
                  {newTeamVisible && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-foreground">
                  {t("Visible in team selection", "مرئي في اختيار الفريق", "Visible dans la sélection d'équipe")}
                </span>
              </div>

              {teamCreateError && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {teamCreateError}
                </div>
              )}
            </div>

            <div className="px-4 py-4 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="h-9 px-4 bg-muted text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                {t("Dismiss", "إغلاق", "Fermer")}
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || !newTeamLeague || isCreatingTeam}
                className="h-9 px-4 bg-[#3f52ff] dark:bg-[#3f52ff] text-sm font-medium text-white rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTeam
                  ? t("Creating...", "جارٍ الإنشاء...", "Création...")
                  : t("Create Team", "إنشاء فريق", "Créer une équipe")}
              </button>
            </div>
          </motion.div>
        </div>
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
        className="relative bg-card border border-border rounded-xl w-full max-w-[560px] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-950/40 border border-[#8faeff] rounded-lg p-3 flex items-center justify-center">
              <Code className="w-4 h-4 text-[#3f52ff] dark:text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-foreground">Slido Embed</h2>
              <p className="text-xs text-muted-foreground">Add interactive polls and Q&A to your event with Slido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder='<iframe src="...."></iframe>'
              className="w-full min-h-[180px] p-4 bg-card border border-border rounded-xl text-sm text-foreground focus:border-[#3f52ff] dark:focus:border-[#8faeff] outline-none transition-colors resize-none placeholder:text-muted-foreground font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Copy the embed code from Slido and paste it here</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-6 text-sm font-semibold text-[#3f52ff] dark:text-white bg-blue-100 dark:bg-blue-950/40/50 rounded-lg hover:bg-blue-100 dark:bg-blue-950/40 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !embedCode.trim()}
            className="h-10 px-6 text-sm font-semibold text-white bg-[#3f52ff] dark:bg-[#3f52ff] rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="relative bg-card border border-border rounded-xl w-full max-w-[480px] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 rounded-lg p-2 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Cancel Event</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            If you aren&apos;t able to host your event, you can cancel and we&apos;ll notify your guests. This event will be permanently deleted.
          </p>

          {/* Toggle Section */}
          <AriaSwitch
            isSelected={customiseNotification}
            onChange={setCustomiseNotification}
            className="flex-row-reverse justify-between w-full"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">Customise Notification</span>
              <span className="text-xs text-muted-foreground">Send a custom message to guests</span>
            </div>
          </AriaSwitch>

          {customiseNotification && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">Notification Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-10 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:border-[#3f52ff] dark:focus:border-[#8faeff] outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Custom Message"
                    className="w-full min-h-[120px] p-3 bg-card border border-border rounded-lg text-sm text-foreground focus:border-[#3f52ff] dark:focus:border-[#8faeff] outline-none transition-colors resize-none placeholder:text-muted-foreground"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-muted rounded text-[10px] font-medium text-muted-foreground">
                    {message.length}/280 characters
                  </div>
                  <div className="absolute bottom-3 right-3 w-7 h-7 bg-muted rounded flex items-center justify-center">
                    <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              This action cannot be undone. <span className="font-bold">{guestCount} registered guests will be notified.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 h-11 px-4 text-sm font-semibold text-foreground bg-card border border-border rounded-xl hover:bg-muted/70 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleCancelEvent}
            disabled={loading}
            className="flex-1 h-11 px-4 text-sm font-semibold text-white bg-destructive rounded-xl hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
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
  const numLabels = 6; // Show 6 labels (including 0)
  const yAxisStep = yAxisMax / (numLabels - 1);

  // Generate Y-axis labels (from max down to 0, including 0)
  const yAxisLabels = Array.from({ length: numLabels }, (_, i) => Math.round(yAxisMax - (i * yAxisStep)));

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
      <div className="grid grid-cols-2 md:flex md:items-stretch border border-border rounded-lg bg-card overflow-hidden">
        {/* Total Registrations */}
        <div className="flex-1 flex items-center justify-between p-4 border-r border-border border-b md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Total Registrations</span>
              <span className="text-xs font-normal text-muted-foreground leading-[18px]">68% of capacity</span>
            </div>
          </div>
          <span className="text-base font-semibold text-foreground leading-[18px]">342</span>
        </div>
        {/* Checked In Users */}
        <div className="flex-1 flex items-center justify-between p-4 border-b border-border md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <LogIn className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Checked In Users</span>
              <span className="text-xs font-normal text-muted-foreground leading-[18px]">0% attendance rate</span>
            </div>
          </div>
          <span className="text-base font-semibold text-foreground leading-[18px]">0</span>
        </div>
        {/* Checked Out Users */}
        <div className="flex-1 flex items-center justify-between p-4 border-r border-border md:border-r">
          <div className="flex items-center gap-2">
            <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Checked Out Users</span>
              <span className="text-xs font-normal text-muted-foreground leading-[18px]">0% of checked in</span>
            </div>
          </div>
          <span className="text-base font-semibold text-foreground leading-[18px]">0</span>
        </div>
        {/* Booked Users */}
        <div className="flex-1 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-background border border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Booked Users</span>
              <span className="text-xs font-normal text-muted-foreground leading-[18px]">Checked-in</span>
            </div>
          </div>
          <span className="text-base font-semibold text-foreground leading-[18px]">2</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground leading-[18px]">Registrations Over Time</span>
            <span className="text-xs font-normal text-muted-foreground leading-[18px]">Track how registrations grew over time</span>
          </div>
          <Menu>
            <MenuButton className="h-8 px-3 bg-muted rounded-lg flex items-center gap-1 text-xs font-medium text-foreground hover:bg-muted transition-colors">
              {timeFilter}
              <ChevronDown className="w-4 h-4" />
            </MenuButton>
            <Portal>
              <MenuItems
                anchor="bottom end"
                transition
                className="z-[100] mt-1 bg-card border border-border rounded-xl p-1 shadow-lg w-[140px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
              >
                {["Last 24 Hours", "Last 7 days", "Last 30 days", "Last 60 days"].map((option) => (
                  <MenuItem key={option}>
                    <button
                      onClick={() => setTimeFilter(option)}
                      className="flex w-full px-3 py-2 rounded-lg text-sm font-medium text-foreground data-[focus]:bg-muted hover:bg-muted transition-colors focus:outline-none"
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
              <span key={val} className="text-sm font-semibold text-muted-foreground leading-[18px]">{val}</span>
            ))}
          </div>

          {/* Chart container */}
          <div className="flex-1 flex flex-col">
            {/* Bars area */}
            <div className="flex-1 relative" style={{ height: chartHeight }}>
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {yAxisLabels.map((_, i) => (
                  <div key={i} className="border-b border-border" />
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
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded mb-1 whitespace-nowrap">
                        {item.value}
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full bg-[#3f52ff] dark:bg-[#3f52ff] rounded-t-sm transition-all duration-300 hover:bg-[#2a3bcc] dark:hover:bg-[#2a3bcc] min-w-[4px]"
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
                  <span className="text-sm font-semibold text-muted-foreground leading-[18px] truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center">
          <span className="text-sm font-normal text-muted-foreground">{getFooterText()}</span>
        </div>
      </div>

      {/* Bottom Tables Row */}
      <div className="flex gap-4">
        {/* Check-In Summary */}
        <div className="flex-1 bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
          <span className="text-base font-semibold text-muted-foreground leading-[18px]">Check-In Summary</span>
          <div className="flex flex-col gap-2 text-sm leading-[18px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Registered</span>
              <span className="font-semibold text-muted-foreground">342</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Checked In</span>
              <span className="font-semibold text-muted-foreground">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Checked Out</span>
              <span className="font-semibold text-muted-foreground">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Still Inside</span>
              <span className="font-semibold text-muted-foreground">0</span>
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="flex-1 bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
          <span className="text-base font-semibold text-muted-foreground leading-[18px]">Event Information</span>
          <div className="flex flex-col gap-2 text-sm leading-[18px]">
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Event Type</span>
              <span className="font-semibold text-muted-foreground">General Event</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Mode</span>
              <span className="font-semibold text-muted-foreground">On Site</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Language</span>
              <span className="font-semibold text-muted-foreground">English</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-foreground">Capacity</span>
              <span className="font-semibold text-muted-foreground">500</span>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative bg-card border border-border rounded-xl w-[420px] flex flex-col gap-4 shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="bg-destructive/10 rounded-md p-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-base font-semibold text-foreground">
              Delete Event
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="px-4">
          <p className="text-sm font-semibold text-muted-foreground leading-[20px]">
            Are you sure you want to delete{" "}
            <span className="font-bold text-foreground">
              &quot;{event.title}&quot;
            </span>
            ? This action cannot be undone and will permanently remove the event
            and all associated data.
          </p>
        </div>
        {/* Modal Footer */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
      </motion.div>
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

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 flex flex-col flex-1 min-w-0 cursor-pointer hover:border-[#3f52ff] transition-all group"
    >
      <div className="flex flex-col gap-4">
        {/* Cover Image */}
        <div className="relative w-full h-[150px] rounded-lg overflow-hidden bg-muted">
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
          {/* 3-dot menu */}
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="h-6 px-3 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center gap-[3px] hover:bg-blue-100 dark:bg-blue-950/40 transition-colors"
            >
              <div className="w-[5px] h-[5px] bg-muted-foreground rounded-full" />
              <div className="w-[5px] h-[5px] bg-muted-foreground rounded-full" />
              <div className="w-[5px] h-[5px] bg-muted-foreground rounded-full" />
            </button>
            {menuOpen && (
              <div className="absolute top-8 right-0 bg-background border border-border rounded-xl p-1 shadow-lg z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onClick();
                  }}
                  className="flex items-center gap-2 w-full h-8 px-2 rounded text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 w-full h-8 px-2 rounded text-sm font-medium text-destructive hover:bg-muted transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
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
            <h3 className="text-lg font-semibold text-foreground leading-[18px]">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 h-5 px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-[10px] font-medium rounded-[4px] leading-none">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                </svg>
                {event.eventCategory === "match" ? (event.league || "League") : event.chapter}
              </span>
              <span className="inline-flex items-center h-5 px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-[10px] font-medium rounded-[4px] leading-none">
                {event.type}
              </span>
              {event.date && (
                <span className="text-sm font-normal text-muted-foreground leading-[18px]">
                  {event.date}
                </span>
              )}
            </div>
          </div>

          {/* Location + Signups */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-normal text-foreground leading-[18px]">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardPenLine className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-normal text-foreground leading-[18px]">
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
  const parsedMatchDetails =
    typeof dbEvent.match_details === "string"
      ? (() => {
          try {
            return JSON.parse(dbEvent.match_details);
          } catch {
            return null;
          }
        })()
      : dbEvent.match_details;

  const parsedDescription =
    typeof dbEvent.description === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(dbEvent.description);
            return parsed && typeof parsed === "object" ? parsed : null;
          } catch {
            return null;
          }
        })()
      : null;

  const matchDetails = parsedMatchDetails || parsedDescription?.match_details || null;

  const eventDate = dbEvent.event_date ? new Date(dbEvent.event_date) : null;
  const dateGroup = eventDate
    ? eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "No Date";

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    coverImage: dbEvent.cover_image || "/img/event-cover-1.jpg",
    chapter: dbEvent.chapter || "Dubai Chapter",
    league: matchDetails?.league || "",
    homeTeam: matchDetails?.homeTeam || "",
    awayTeam: matchDetails?.awayTeam || "",
    enableLineUpAnnouncement: Boolean(matchDetails?.enableLineUpAnnouncement),
    lineUpAnnouncementTime: matchDetails?.lineUpAnnouncementTime || "45 min before match",
    homeTeamLineup: matchDetails?.homeTeamLineup || "",
    awayTeamLineup: matchDetails?.awayTeamLineup || "",
    livestreamUrl: matchDetails?.livestreamUrl || "",
    stadiumVenueName: matchDetails?.stadiumVenueName || "",
    ticketsUrl: matchDetails?.ticketsUrl || "",
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
  const [chapters, setChapters] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch("/api/chapters");
        const json = await res.json();
        if (json.success && json.data) {
          setChapters(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch chapters", err);
      }
    };
    fetchChapters();
  }, []);

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

      let response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }

        // Some environments fail multipart parsing. Retry with raw binary payload.
        if (errorData.error?.toLowerCase().includes("invalid form data")) {
          const query = new URLSearchParams({
            folder: "events",
            fileName: file.name,
          }).toString();

          response = await fetch(`/api/upload?${query}`, {
            method: "POST",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
              "x-file-name": file.name,
            },
            body: file,
          });
        }

        if (!response.ok) {
          let retryErrorData: { error?: string } = {};
          try {
            retryErrorData = await response.json();
          } catch {
            retryErrorData = {};
          }
          console.error("Upload failed:", retryErrorData.error);
          return null;
        }
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
        match_details: savedEvent.eventCategory === "match" ? {
          league: savedEvent.league || "",
          homeTeam: savedEvent.homeTeam || "",
          awayTeam: savedEvent.awayTeam || "",
          enableLineUpAnnouncement: Boolean(savedEvent.enableLineUpAnnouncement),
          lineUpAnnouncementTime: savedEvent.lineUpAnnouncementTime || "",
          homeTeamLineup: savedEvent.homeTeamLineup || "",
          awayTeamLineup: savedEvent.awayTeamLineup || "",
          livestreamUrl: savedEvent.livestreamUrl || "",
          stadiumVenueName: savedEvent.stadiumVenueName || "",
          ticketsUrl: savedEvent.ticketsUrl || "",
        } : null,
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
        chapter: formData.chapter,
        type: formData.type,
        event_category: formData.eventCategory,
        event_date: eventDateIso,
        location: formData.location,
        signups: 0,
        max_signups: maxSignups,
        description: formData.description,
        // Match-specific fields stored as JSON in description or separate fields
        match_details: formData.eventCategory === "match" ? {
          league: formData.league,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          enableLineUpAnnouncement: formData.enableLineUpAnnouncement,
          lineUpAnnouncementTime: formData.lineUpAnnouncementTime,
          homeTeamLineup: formData.homeTeamLineup,
          awayTeamLineup: formData.awayTeamLineup,
          livestreamUrl: formData.livestreamUrl,
          stadiumVenueName: formData.stadiumVenueName,
        } : null,
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
    <div className="flex min-h-screen w-full max-w-full bg-background font-[family-name:'Instrument_Sans',sans-serif]">
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open sidebar"
              className="lg:hidden h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground"
              onClick={() => window.dispatchEvent(new Event("open-admin-sidebar"))}
            >
              <div className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-4 bg-foreground" />
                <span className="block h-0.5 w-4 bg-foreground" />
              </div>
            </button>
            <nav className="hidden md:flex items-center gap-0.5 text-sm">
              <span className="text-muted-foreground font-medium px-1 py-0.5">
                <Calendar className="w-4 h-4 inline mr-1" />
              </span>
              <span className="text-muted-foreground font-medium px-1 py-0.5">Event</span>
            </nav>
          </div>
          <div className="bg-muted rounded-full p-[7px]">
            <Bell className="w-[17px] h-[17px] text-foreground" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 min-w-0">
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
            <div className="bg-[#ECEFF2] border border-border rounded-lg p-2 pb-2 flex flex-col gap-4">
              {/* Page Header */}
              <div className="flex flex-col gap-2 pl-4 pt-2">
                <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
                  Events Management
                </h1>
                <p className="text-base font-semibold text-muted-foreground leading-[18px]">
                  This section enables you to manage your app members and Teams
                </p>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 md:flex md:items-stretch border border-border rounded-xl bg-card overflow-hidden">
                {/* Total Events */}
                <div className="col-span-2 md:col-span-1 flex-1 flex items-center justify-between p-4 border-b border-border md:border-b-0 md:border-r">
                  <div className="flex items-center gap-2">
                    <div className="bg-background border-[0.6px] border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <svg className="text-muted-foreground" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.3333 14V12.6667C11.3333 11.9594 11.0524 11.2811 10.5523 10.781C10.0522 10.281 9.37391 10 8.66667 10H3.33333C2.62609 10 1.94781 10.281 1.44772 10.781C0.947621 11.2811 0.666667 11.9594 0.666667 12.6667V14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 6 7.33333Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.3333 14V12.6667C15.3328 12.0758 15.1362 11.5019 14.7742 11.0349C14.4122 10.5679 13.9054 10.2344 13.3333 10.0867" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.6667 2.08667C11.2403 2.23354 11.7487 2.56714 12.1118 3.03488C12.4748 3.50262 12.6719 4.07789 12.6719 4.67C12.6719 5.26211 12.4748 5.83738 12.1118 6.30512C11.7487 6.77286 11.2403 7.10646 10.6667 7.25333" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
                        Total Events
                      </span>
                      <span className="text-xs font-normal text-muted-foreground leading-[18px]">
                        All Events
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-semibold text-foreground leading-[18px]">
                    {totalEvents}
                  </span>
                </div>

                {/* Match */}
                <div className="flex-1 flex items-center justify-between p-4 border-r border-border md:border-r">
                  <div className="flex items-center gap-2">
                    <div className="bg-background border-[0.6px] border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <svg className="text-muted-foreground" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.6667 14V12.6667C10.6667 11.9594 10.3857 11.2811 9.88562 10.781C9.38552 10.281 8.70724 10 8 10H4C3.29276 10 2.61448 10.281 2.11438 10.781C1.61429 11.2811 1.33333 11.9594 1.33333 12.6667V14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 6 7.33333Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.6667 5.33333L11.3333 6.66667L10.6667 6" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.6667 6.66667C14.6667 8.87581 12.876 10.6667 10.6667 10.6667" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
                        Match
                      </span>
                      <span className="text-xs font-normal text-muted-foreground leading-[18px]">
                        {matchPercent}% of total
                      </span>
                    </div>
                  </div>
                  <span className="text-xl font-semibold text-foreground leading-[18px]">
                    {matchCount}
                  </span>
                </div>

                {/* General Event */}
                <div className="flex-1 flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-background border-[0.6px] border-border rounded-[5.4px] p-[7.2px] flex items-center justify-center">
                      <svg className="text-muted-foreground" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.3333 14V12.6667C11.3333 11.9594 11.0524 11.2811 10.5523 10.781C10.0522 10.281 9.37391 10 8.66667 10H3.33333C2.62609 10 1.94781 10.281 1.44772 10.781C0.947621 11.2811 0.666667 11.9594 0.666667 12.6667V14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 6 7.33333Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.3333 14V12.6667C15.3328 12.0758 15.1362 11.5019 14.7742 11.0349C14.4122 10.5679 13.9054 10.2344 13.3333 10.0867" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.6667 2.08667C11.2403 2.23354 11.7487 2.56714 12.1118 3.03488C12.4748 3.50262 12.6719 4.07789 12.6719 4.67C12.6719 5.26211 12.4748 5.83738 12.1118 6.30512C11.7487 6.77286 11.2403 7.10646 10.6667 7.25333" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
                        General Event
                      </span>
                      <span className="text-xs font-normal text-muted-foreground leading-[18px]">
                        {generalPercent}% of total
                      </span>
                    </div>
                  </div>
                  <span className="text-xl font-semibold text-foreground leading-[18px]">
                    {generalCount}
                  </span>
                </div>
              </div>

              {/* Tabs + Filters Bar */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {/* Mobile: tabs dropdown + CTA */}
                <div className="md:hidden flex items-center justify-between gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <AriaSelect
                      aria-label="Select Events Tab"
                      selectedKey={activeTab}
                      onSelectionChange={(k) => setActiveTab(k as any)}
                    >
                      <AriaSelectItem id="all" textValue="All events">All events</AriaSelectItem>
                      <AriaSelectItem id="current" textValue="Current Event">Current Event</AriaSelectItem>
                      <AriaSelectItem id="past" textValue="Past Events">Past Events</AriaSelectItem>
                    </AriaSelect>
                  </div>
                  {hasEvents && (
                    <button
                      onClick={handleCreateEvent}
                      className="flex items-center gap-1 h-9 px-4 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-normal rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors shrink-0"
                    >
                      + Create Event
                    </button>
                  )}
                </div>

                {/* Desktop: Event tabs */}
                <div className="hidden md:inline-flex items-center bg-[#ECEFF2] rounded-lg p-1 relative self-start w-fit">
                  {(["all", "current", "past"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative h-9 px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors z-10 ${activeTab === tab
                        ? "text-[#3f52ff] dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="eventsTabIndicator"
                          className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
                        {chapters.map(c => (
                          <AriaSelectItem key={c.id} id={c.name} textValue={c.name}>{c.name}</AriaSelectItem>
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
                      className="hidden md:flex items-center gap-1 h-9 px-4 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-normal rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors"
                    >
                      + Create Event
                    </button>
                  </div>
                )}
              </div>

              {/* Events Content: Loading, Empty State or Events List */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 bg-card border border-border rounded-xl">
                  <Loader2 className="w-8 h-8 text-[#3f52ff] dark:text-white animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading events...</p>
                </div>
              ) : hasEvents ? (
                hasFilteredEvents ? (
                  <div className="flex flex-col gap-4">
                    {Object.entries(groupedEvents).map(([dateGroup, events]) => (
                      <div key={dateGroup} className="flex flex-col gap-4">
                        {/* Date Group Header */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-muted-foreground leading-[18px] whitespace-nowrap">
                            {dateGroup}
                          </span>
                          <div className="flex-1 h-px bg-muted" />
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
                  <div className="flex flex-col items-center justify-center gap-4 py-16 bg-card border border-border rounded-xl">
                    <Image
                      src="/img/events-empty.svg"
                      alt="No events found"
                      width={165}
                      height={160}
                      className="object-contain"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
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
                      className="text-sm font-medium text-[#3f52ff] dark:text-white hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )
              ) : (
                /* Empty State - No Events Created Yet */
                <div className="flex flex-col items-center justify-center gap-4 py-16 bg-card border border-border rounded-xl">
                  <Image
                    src="/img/events-empty.svg"
                    alt="No events"
                    width={165}
                    height={160}
                    className="object-contain"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <h3 className="text-lg font-semibold text-foreground">No events yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      You haven&apos;t created any events yet. <br /> Click the button below to create your first event.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateEvent}
                    className="flex items-center gap-1 h-9 px-4 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors"
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
