"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
  Loader2,
  Link,
  CheckCircle,
  ClipboardPenLine,
  ArrowUpRight,
  Info,
  X,
  Upload,
  Link2,
  Search,
  User,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import { AriaDatePicker } from "@/components/ui/aria-date-picker";
import { AriaSlider } from "@/components/ui/aria-slider";
import { AriaSwitch } from "@/components/ui/aria-switch";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { toastQueue } from "@/components/ui/aria-toast";
import { today, getLocalTimeZone, DateValue } from "@internationalized/date";
import { TIMEZONES } from "@/data/timezones";

const DEFAULT_TEAMS = ["Al-Hilal", "Etihad Jeddah", "Al-Nassr"];
const MAX_UPLOAD_IMAGE_SIZE = 10 * 1024 * 1024;

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
  // Match-specific fields
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  enableLineUpAnnouncement?: boolean;
  lineUpAnnouncementTime?: string;
  homeTeamLineup?: string;
  awayTeamLineup?: string;
  livestreamUrl?: string;
  stadiumVenueName?: string;
  matchDescription?: string;
}

export function CreateEventScreen({ onClose, onSave, isSaving = false }: CreateEventScreenProps) {
  // Form state
  const [eventTitle, setEventTitle] = useState("");
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
  const [virtualMeetingUrl, setVirtualMeetingUrl] = useState("");
  const [virtualAdditionalInfo, setVirtualAdditionalInfo] = useState("");

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
  const [eventDescription, setEventDescription] = useState("");
  const [chapter, setChapter] = useState("Dubai Chapter");
  const [ticketGoLive, setTicketGoLive] = useState("Custom Date");
  const [capacity, setCapacity] = useState("Unlimited");
  const [coverImage, setCoverImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Match-specific state
  const [league, setLeague] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [enableLineUpAnnouncement, setEnableLineUpAnnouncement] = useState(false);
  const [lineUpAnnouncementTime, setLineUpAnnouncementTime] = useState("45 min before match");
  const [homeTeamLineup, setHomeTeamLineup] = useState("");
  const [awayTeamLineup, setAwayTeamLineup] = useState("");
  const [matchLocationType, setMatchLocationType] = useState<"onsite" | "virtual">("virtual");
  const [livestreamUrl, setLivestreamUrl] = useState("");
  const [matchDescription, setMatchDescription] = useState("");
  const [ticketsUrl, setTicketsUrl] = useState("");
  const [stadiumVenueName, setStadiumVenueName] = useState("");
  const [matchLocationMasking, setMatchLocationMasking] = useState(false);
  const [timezone, setTimezone] = useState(TIMEZONES[13] || "UTC+01:00 — Paris / Berlin / Rome / Madrid");
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);

  const [language, setLanguage] = useState<"English" | "French" | "Arabic">("English");
  const isArabic = language === "Arabic";
  const t = (english: string, arabic?: string, french?: string) => {
    if (language === "Arabic") return arabic ?? english;
    if (language === "French") return french ?? english;
    return english;
  };

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

  const timezoneGroups = useMemo(() => {
    const groups: Record<string, string[]> = {
      "Americas": [],
      "Europe & Africa": [],
      "Middle East & Central Asia": [],
      "Asia Pacific": [],
      "Global": [],
    };
    const query = timezoneQuery.trim().toLowerCase();
    TIMEZONES.forEach((tz) => {
      if (query && !tz.toLowerCase().includes(query)) return;
      let continent = "Global";
      if (/(Pago Pago|Honolulu|Anchorage|Los Angeles|Vancouver|Denver|Calgary|Chicago|Mexico City|New York|Toronto|Caracas|Halifax|Newfoundland|Sao Paulo|Buenos Aires)/i.test(tz)) {
        continent = "Americas";
      } else if (/(London|Lisbon|Casablanca|Paris|Berlin|Rome|Madrid|Cairo|Jerusalem|Johannesburg|Azores)/i.test(tz)) {
        continent = "Europe & Africa";
      } else if (/(Istanbul|Moscow|Nairobi|Riyadh|Tehran|Dubai|Baku|Tbilisi|Kabul|Karachi|Tashkent|Yekaterinburg)/i.test(tz)) {
        continent = "Middle East & Central Asia";
      } else if (/(New Delhi|Mumbai|Colombo|Kathmandu|Dhaka|Almaty|Omsk|Yangon|Bangkok|Jakarta|Hanoi|Singapore|Perth|Beijing|Hong Kong|Eucla|Tokyo|Seoul|Yakutsk|Adelaide|Darwin|Sydney|Brisbane|Vladivostok|Lord Howe Island|Noumea|Magadan|Solomon Is.|Auckland|Suva|Anadyr|Chatham Islands|Nukualofa|Kiritimati)/i.test(tz)) {
        continent = "Asia Pacific";
      }
      groups[continent].push(tz);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [timezoneQuery]);

  const [timezoneOffset, timezoneCity] = useMemo(() => {
    const [offset, city] = timezone.split(" — ");
    return [offset || timezone, city || ""];
  }, [timezone]);

  // Modal state
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueNameAr, setNewLeagueNameAr] = useState("");
  const [newLeagueWebsite, setNewLeagueWebsite] = useState("");
  const [newLeagueLogo, setNewLeagueLogo] = useState<string>("");
  const [newLeagueVisible, setNewLeagueVisible] = useState(true);
  const leagueLogoInputRef = useRef<HTMLInputElement>(null);

  // Custom leagues list
  const [customLeagues, setCustomLeagues] = useState<string[]>([]);

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
      // Reset form
      setNewLeagueName("");
      setNewLeagueNameAr("");
      setNewLeagueWebsite("");
      setNewLeagueLogo("");
      setNewLeagueVisible(true);
    }
  };

  // Team State
  const [teams, setTeams] = useState<string[]>(DEFAULT_TEAMS);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Create Team Modal State
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
    if (minutes === 0) return `${hours} ${t("hours", "ساعة", "heures")}`;
    return `${hours}h ${minutes}m`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid image",
        description: "Please select a valid image file.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      toastQueue.add({
        title: "File too large",
        description: "Image size must be less than 10MB.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formatDateForDisplay = (date: DateValue | null) => {
    if (!date) return "lun. 24 nov.";
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const weekdays = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    const months = ["jan.", "fév.", "mar.", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    return `${weekdays[jsDate.getDay()]} ${date.day} ${months[date.month - 1]}`;
  };

  const handleSubmit = () => {
    // For match events, construct title from homeTeam and awayTeam
    const finalTitle = isMatchEvent
      ? `${homeTeam} Vs ${awayTeam}`
      : eventTitle;

    const resolvedDescription = isMatchEvent ? matchDescription : eventDescription;

    onSave({
      title: finalTitle,
      coverImage,
      eventCategory,
      startDate,
      startTime,
      endDate,
      endTime,
      locationType: isMatchEvent ? matchLocationType : locationType,
      location: isMatchEvent
        ? (matchLocationType === "onsite" ? stadiumVenueName : livestreamUrl)
        : locationInput,
      geoFenceRadius,
      locationMasking: isMatchEvent ? matchLocationMasking : locationMasking,
      locationMaskName,
      description: resolvedDescription,
      matchDescription: isMatchEvent ? matchDescription : undefined,
      chapter,
      ticketGoLive,
      capacity,
      type: (isMatchEvent
        ? (matchLocationType === "virtual" ? "Online" : "Onsite")
        : (locationType === "virtual" ? "Online" : "Onsite")) as "Onsite" | "Online" | "Hybrid",
      // Match-specific fields
      league,
      homeTeam,
      awayTeam,
      enableLineUpAnnouncement,
      lineUpAnnouncementTime,
      homeTeamLineup,
      awayTeamLineup,
      livestreamUrl,
      stadiumVenueName,
    });
  };
  const isMatchEvent = eventCategory === "match";

  return (
    <div
      className={`bg-[#ECEFF2] border border-border rounded-lg p-4 pb-2 flex flex-col gap-4 ${isArabic ? "font-ko-sans-ar" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="flex lg:flex-row flex-col gap-4 items-start">
        {/* Left: Event Preview Card */}
        <div className="hidden lg:flex w-full lg:w-[493px] shrink-0 bg-card border border-border rounded-lg p-3 flex-col gap-4 h-fit">
          {/* Cover Image */}
          <div
            className="relative w-full h-[264px] rounded-lg overflow-hidden bg-[#D5DDE2] cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt="Event cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D5DDE2]" />
            )}
            {/* Centered Upload Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="34" height="34" rx="17" fill="#3F52FF" />
                <rect x="1" y="1" width="34" height="34" rx="17" stroke="white" strokeWidth="2" />
                <path fillRule="evenodd" clipRule="evenodd" d="M18 10.25H17.958C16.589 10.25 15.504 10.25 14.638 10.338C13.75 10.428 13.009 10.618 12.361 11.051C11.8434 11.3985 11.3985 11.8434 11.051 12.361C10.617 13.009 10.428 13.751 10.338 14.638C10.25 15.504 10.25 16.589 10.25 17.958V18.042C10.25 19.411 10.25 20.496 10.338 21.362C10.428 22.25 10.618 22.991 11.051 23.639C11.397 24.158 11.842 24.603 12.361 24.949C13.009 25.383 13.751 25.572 14.638 25.662C15.504 25.75 16.589 25.75 17.958 25.75H18.042C19.411 25.75 20.496 25.75 21.362 25.662C22.25 25.572 22.991 25.382 23.639 24.95C24.1567 24.6023 24.6016 24.157 24.949 23.639C25.383 22.991 25.572 22.249 25.662 21.362C25.75 20.496 25.75 19.411 25.75 18.042V17.958C25.75 16.589 25.75 15.504 25.662 14.638C25.572 13.75 25.382 13.009 24.95 12.361C24.6023 11.8433 24.157 11.3984 23.639 11.051C22.991 10.617 22.249 10.428 21.362 10.338C20.496 10.25 19.411 10.25 18.042 10.25H18ZM20.32 18.785C20.476 18.575 21.055 17.917 21.806 18.385C22.284 18.68 22.686 19.079 23.116 19.505C23.28 19.669 23.396 19.855 23.475 20.054C23.709 20.654 23.587 21.377 23.337 21.972C23.1956 22.3182 22.9808 22.6297 22.7076 22.885C22.4343 23.1403 22.109 23.3334 21.754 23.451C21.4358 23.5517 21.1038 23.602 20.77 23.6H14.87C14.283 23.6 13.764 23.46 13.338 23.197C13.071 23.032 13.024 22.652 13.222 22.406C13.5513 21.9947 13.88 21.5807 14.208 21.164C14.836 20.367 15.259 20.135 15.73 20.338C15.92 20.422 16.112 20.548 16.309 20.681C16.834 21.038 17.564 21.528 18.525 20.996C19.183 20.627 19.565 19.996 19.897 19.445L19.903 19.435L19.973 19.32C20.0805 19.1365 20.1963 18.958 20.32 18.785ZM13.8 15.55C13.8 14.585 14.584 13.8 15.55 13.8C16.0141 13.8 16.4592 13.9844 16.7874 14.3126C17.1156 14.6408 17.3 15.0859 17.3 15.55C17.3 16.0141 17.1156 16.4592 16.7874 16.7874C16.4592 17.1156 16.0141 17.3 15.55 17.3C14.584 17.3 13.8 16.515 13.8 15.55Z" fill="white" />
              </svg>
              <span className="text-xs font-medium text-black">Recomended (469 X 264)</span>
            </div>
            {/* Hover overlay for changing image */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="34" height="34" rx="17" fill="#3F52FF" />
                <rect x="1" y="1" width="34" height="34" rx="17" stroke="white" strokeWidth="2" />
                <path fillRule="evenodd" clipRule="evenodd" d="M18 10.25H17.958C16.589 10.25 15.504 10.25 14.638 10.338C13.75 10.428 13.009 10.618 12.361 11.051C11.8434 11.3985 11.3985 11.8434 11.051 12.361C10.617 13.009 10.428 13.751 10.338 14.638C10.25 15.504 10.25 16.589 10.25 17.958V18.042C10.25 19.411 10.25 20.496 10.338 21.362C10.428 22.25 10.618 22.991 11.051 23.639C11.397 24.158 11.842 24.603 12.361 24.949C13.009 25.383 13.751 25.572 14.638 25.662C15.504 25.75 16.589 25.75 17.958 25.75H18.042C19.411 25.75 20.496 25.75 21.362 25.662C22.25 25.572 22.991 25.382 23.639 24.95C24.1567 24.6023 24.6016 24.157 24.949 23.639C25.383 22.991 25.572 22.249 25.662 21.362C25.75 20.496 25.75 19.411 25.75 18.042V17.958C25.75 16.589 25.75 15.504 25.662 14.638C25.572 13.75 25.382 13.009 24.95 12.361C24.6023 11.8433 24.157 11.3984 23.639 11.051C22.991 10.617 22.249 10.428 21.362 10.338C20.496 10.25 19.411 10.25 18.042 10.25H18ZM20.32 18.785C20.476 18.575 21.055 17.917 21.806 18.385C22.284 18.68 22.686 19.079 23.116 19.505C23.28 19.669 23.396 19.855 23.475 20.054C23.709 20.654 23.587 21.377 23.337 21.972C23.1956 22.3182 22.9808 22.6297 22.7076 22.885C22.4343 23.1403 22.109 23.3334 21.754 23.451C21.4358 23.5517 21.1038 23.602 20.77 23.6H14.87C14.283 23.6 13.764 23.46 13.338 23.197C13.071 23.032 13.024 22.652 13.222 22.406C13.5513 21.9947 13.88 21.5807 14.208 21.164C14.836 20.367 15.259 20.135 15.73 20.338C15.92 20.422 16.112 20.548 16.309 20.681C16.834 21.038 17.564 21.528 18.525 20.996C19.183 20.627 19.565 19.996 19.897 19.445L19.903 19.435L19.973 19.32C20.0805 19.1365 20.1963 18.958 20.32 18.785ZM13.8 15.55C13.8 14.585 14.584 13.8 15.55 13.8C16.0141 13.8 16.4592 13.9844 16.7874 14.3126C17.1156 14.6408 17.3 15.0859 17.3 15.55C17.3 16.0141 17.1156 16.4592 16.7874 16.7874C16.4592 17.1156 16.0141 17.3 15.55 17.3C14.584 17.3 13.8 16.515 13.8 15.55Z" fill="white" />
              </svg>
            </div>
          </div>
          <input
            id="event-cover-upload"
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {/* Event Info */}
          <div className="flex flex-col gap-4">
            {/* Title + Badges */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground leading-[18px]">
                {isMatchEvent
                  ? (homeTeam && awayTeam ? `${homeTeam} Vs ${awayTeam}` : t("Team A Vs Team B", "الفريق أ ضد الفريق ب", "Équipe A vs Équipe B"))
                  : (eventTitle || t("Event name", "اسم الحدث", "Nom de l'événement"))}
              </h3>
              <div className="flex items-center gap-2">
                {isMatchEvent ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-xs font-medium rounded">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                      </svg>
                      {league || t("Select League", "اختر الدوري", "Sélectionner une ligue")}
                    </span>
                    <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
                      {matchLocationType === "virtual"
                        ? t("Virtual", "افتراضي", "Virtuel")
                        : t("Onsite", "حضوري", "Sur site")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-xs font-medium rounded">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                      </svg>
                      {chapter}
                    </span>
                    <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
                      {locationType === "virtual"
                        ? t("Online", "عبر الإنترنت", "En ligne")
                        : t("Onsite", "حضوري", "Sur site")}
                    </span>
                  </>
                )}
              </div>

              {teamCreateError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {teamCreateError}
                </div>
              )}
            </div>

            {/* Date & Venue Row */}
            <div className="flex items-start gap-8 flex-wrap">
              {/* Date Section */}
              <div className="flex items-center gap-2">
                {/* Date Box */}
                <div className="w-10 h-11 border border-border rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-[#859BAB] px-0.5 py-1 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white/80 uppercase leading-[12px]">
                      {startDate ? (() => {
                        const months = ["JAN.", "FÉV.", "MAR.", "AVR.", "MAI.", "JUI.", "JUL.", "AOÛ.", "SEP.", "OCT.", "NOV.", "DÉC."];
                        return months[startDate.month - 1];
                      })() : "OCT."}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-base font-medium text-muted-foreground leading-none">{startDate?.day || "25"}</span>
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
                    {startTime} - {endTime} {timezoneOffset}
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
                      {matchLocationType === "onsite" && stadiumVenueName
                        ? stadiumVenueName
                        : matchLocationType === "virtual" && livestreamUrl
                          ? livestreamUrl
                          : t("Venue", "الموقع", "Lieu")}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-foreground opacity-50" />
                  </div>
                  <span className="text-sm font-normal text-muted-foreground leading-[21px]">
                    {matchLocationType === "onsite"
                      ? (locationInput ? locationInput.split(",").slice(1, 3).join(",").trim() || "Dubai, Dubai" : "Dubai, Dubai")
                      : (matchLocationType === "virtual" ? t("Online", "عبر الإنترنت", "En ligne") : "Dubai, Dubai")}
                  </span>
                </div>
              </div>
            </div>

            {/* Address + Capacity */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-normal text-foreground leading-[18px]">
                  {matchLocationType === "onsite" && stadiumVenueName
                    ? stadiumVenueName
                    : matchLocationType === "virtual" && livestreamUrl
                      ? livestreamUrl
                      : (locationInput || "Dubai World Trade Center, DWC")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardPenLine className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-normal text-foreground leading-[18px]">
                  {capacity === "Unlimited" ? "0/∞" : `0/${capacity}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form Content */}
        <div
          className={`flex-1 flex flex-col gap-4 min-w-0 ${isArabic ? "font-ko-sans-ar" : ""}`}
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* Header Row: Event Type Tabs + Language Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Event Type Tabs */}
            <div className="flex items-center gap-1 bg-[#D5DDE2] p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setEventCategory("general")}
                className={`relative h-9 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${eventCategory === "general"
                  ? "text-[#3f52ff] dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {eventCategory === "general" && (
                  <motion.div
                    layoutId="eventTypeIndicator"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {t("General Event", "فعالية عامة", "Événement général")}
                </span>
              </button>
              <button
                onClick={() => setEventCategory("match")}
                className={`relative h-9 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${eventCategory === "match"
                  ? "text-[#3f52ff] dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {eventCategory === "match" && (
                  <motion.div
                    layoutId="eventTypeIndicator"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {t("Match", "مباراة", "Match")}
                </span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="w-full sm:w-[100px]">
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

          {/* MATCH FORM */}
          {eventCategory === "match" ? (
            <div className="flex flex-col gap-4">
              {/* Match Setup Section */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#3f52ff] dark:text-white leading-[21px]">
                  {t("Match Setup", "إعداد المباراة", "Configuration du match")}
                </span>

                {/* League Dropdown - Full Width with top rounded corners */}
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
                        {/* Create League Option */}
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

                {/* Home Team & Away Team Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Home Team */}
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
                          {/* Create Team Option */}
                          <MenuItem>
                            <button
                              onClick={() => setShowCreateTeamModal(true)}
                              className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                            </button>
                          </MenuItem>
                          {teams.map((t) => (
                            <MenuItem key={t}>
                              <button
                                onClick={() => setHomeTeam(t)}
                                className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${homeTeam === t
                                  ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                  : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                  }`}
                              >
                                {t}
                              </button>
                            </MenuItem>
                          ))}
                        </MenuItems>
                      </Portal>
                    </Menu>
                  </div>

                  {/* Away Team */}
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
                          {/* Create Team Option */}
                          <MenuItem>
                            <button
                              onClick={() => setShowCreateTeamModal(true)}
                              className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                            </button>
                          </MenuItem>
                          {teams.map((t) => (
                            <MenuItem key={t}>
                              <button
                                onClick={() => setAwayTeam(t)}
                                className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${awayTeam === t
                                  ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                  : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                  }`}
                              >
                                {t}
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
                {/* Start/End Date-Time */}
                <div className="flex-1 bg-card rounded-lg p-1 flex flex-col">
                  {/* Start Row */}
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

                  {/* Vertical Divider */}
                  <div className="ml-[13px] h-4 border-l-[1.5px] border-dashed border-[#3f52ff]" />

                  {/* End Row */}
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

                {/* Timezone */}
                <button
                  type="button"
                  onClick={() => setShowTimezoneModal(true)}
                  className="bg-card rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0 text-left"
                >
                  <Globe className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">{timezoneOffset}</span>
                  {timezoneCity ? (
                    <span className="text-xs font-normal text-muted-foreground">{timezoneCity}</span>
                  ) : null}
                </button>
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

                  {/* Timing Dropdown - Only shown when enabled */}
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

                {/* Home Team Lineup & Away Team Lineup - Only shown when enabled */}
                {enableLineUpAnnouncement && (
                  <>
                    {/* Home Team Lineup */}
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

                    {/* Away Team Lineup */}
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

                {/* Location Type Tabs */}
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

                {/* Location Content based on selected tab */}
                {matchLocationType === "onsite" ? (
                  <div className="bg-card rounded-lg p-3 flex flex-col gap-3">
                    <span className="text-base font-medium text-foreground">
                      {t("Stadium/Venue Name", "اسم الملعب/المكان", "Nom du stade/lieu")}
                    </span>
                    <div className="flex flex-col gap-3">
                      {/* Stadium/Venue Input */}
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

                      {/* Location Masking Toggle */}
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
                      <div className={`absolute ${isArabic ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                      </div>
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
                  {/* Capacity */}
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

                  {/* Tickets Go Live */}
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

              {/* Mobile: Match Preview Card with Image Upload */}
              <div className="lg:hidden w-full bg-card border border-border rounded-lg p-3 flex flex-col gap-4 h-fit">
                {/* Cover Image Upload - Uses the shared fileInputRef from the desktop preview */}
                <div
                  className="relative w-full h-[264px] rounded-lg overflow-hidden bg-[#D5DDE2] cursor-pointer group"
                  onClick={() => {
                    // Trigger the file input from the desktop preview card
                    const fileInput = document.getElementById('event-cover-upload');
                    fileInput?.click();
                  }}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Match cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D5DDE2]" />
                  )}
                  {/* Centered Camera Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <div className="w-[52px] h-[52px] bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full border-[2.889px] border-white flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-black">Recomended (469 X 264)</span>
                  </div>
                  {/* Hover overlay for changing image */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Match Info Preview */}
                <div className="flex flex-col gap-4">
                  {/* Title + Badges */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-foreground leading-[18px]">
                      {homeTeam && awayTeam ? `${homeTeam} Vs ${awayTeam}` : t("Team A Vs Team B", "الفريق أ ضد الفريق ب", "Équipe A vs Équipe B")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-xs font-medium rounded">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                        </svg>
                        {league || t("Select League", "اختر الدوري", "Sélectionner une ligue")}
                      </span>
                      <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
                        {matchLocationType === "virtual"
                          ? t("Virtual", "افتراضي", "Virtuel")
                          : t("Onsite", "حضوري", "Sur site")}
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
                          <span className="text-[8px] font-bold text-white/80 uppercase leading-[12px]">
                            {startDate ? (() => {
                              const months = ["JAN.", "FÉV.", "MAR.", "AVR.", "MAI.", "JUI.", "JUL.", "AOÛ.", "SEP.", "OCT.", "NOV.", "DÉC."];
                              return months[startDate.month - 1];
                            })() : "OCT."}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-base font-medium text-muted-foreground leading-none">{startDate?.day || "25"}</span>
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
                          {startTime} - {endTime} {timezoneOffset}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-normal text-foreground leading-[18px]">
                        {matchLocationType === "onsite" && stadiumVenueName
                          ? stadiumVenueName
                          : matchLocationType === "virtual" && livestreamUrl
                            ? livestreamUrl
                            : "Dubai World Trade Center, DWC"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardPenLine className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-normal text-foreground leading-[18px]">
                        {capacity === "Unlimited" ? "0/∞" : `0/${capacity}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Match Event Button */}
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full h-10 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("Creating...", "جارٍ الإنشاء...", "Création...")}
                  </>
                ) : (
                  t("+ Create Match Event", "+ إنشاء حدث مباراة", "+ Créer un match")
                )}
              </button>
            </div>
          ) : (
            <>
              {/* GENERAL EVENT FORM */}
              {/* Event Title */}
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className={`text-[40px] font-bold text-[#3f52ff] dark:text-white leading-[46px] bg-transparent outline-none w-full placeholder:text-[#3f52ff] dark:placeholder:text-white/70 ${isArabic ? "text-right" : ""}`}
                placeholder={t("Event name", "اسم الحدث", "Nom de l'événement")}
              />

              {/* Date/Time Section */}
              <div className="flex flex-col gap-2">
                <div className="flex sm:flex-row flex-col gap-2">
                  {/* Start/End Date-Time */}
                  <div className="flex-1 bg-card rounded-lg p-1 flex flex-col">
                    {/* Start Row */}
                    <div className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 flex flex-col items-center justify-center px-1">
                          <div className="w-[10px] h-[10px] bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full" />
                        </div>
                        <span className="text-sm font-normal text-foreground">
                          {t("Start", "البداية", "Début")}
                        </span>
                      </div>
                      <div className="flex gap-[2px] items-center">
                        <div className="w-[136px]">
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
                          className="bg-blue-100 dark:bg-blue-950/40 h-9 px-3 py-2 rounded-lg text-base font-normal text-foreground w-[70px] text-center outline-none"
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
                        <span className="text-sm font-normal text-foreground">
                          {t("End", "النهاية", "Fin")}
                        </span>
                      </div>
                      <div className="flex gap-[2px] items-center">
                        <div className="w-[136px]">
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
                          className="bg-blue-100 dark:bg-blue-950/40 h-9 px-3 py-2 rounded-lg text-base font-normal text-foreground w-[70px] text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timezone */}
                  <button
                    type="button"
                    onClick={() => setShowTimezoneModal(true)}
                    className="bg-card rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0 text-left"
                  >
                    <Globe className="w-4 h-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">{timezoneOffset}</span>
                    {timezoneCity ? (
                      <span className="text-xs font-normal text-muted-foreground">{timezoneCity}</span>
                    ) : null}
                  </button>
                </div>

                {/* Duration */}
                <div className="bg-card rounded-lg px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground" />
                  <span className="text-base font-medium text-foreground flex-1">
                    {t("Duration", "المدة", "Durée")}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">{calculateDuration()}</span>
                </div>
              </div>

              {/* Event Location Section */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#3f52ff] dark:text-white">
                  {t("Event Location", "موقع الحدث", "Lieu de l'événement")}
                </span>

                {/* Location Type Tabs */}
                <div className="flex items-center bg-[#D5DDE2] rounded-lg p-[6px] w-full">
                  <button
                    onClick={() => setLocationType("onsite")}
                    className={`relative flex-1 h-[36px] px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${locationType === "onsite"
                      ? "text-[#3f52ff] dark:text-white"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {locationType === "onsite" && (
                      <motion.div
                        layoutId="locationTypeIndicator"
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
                    onClick={() => setLocationType("virtual")}
                    className={`relative flex-1 h-[36px] px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${locationType === "virtual"
                      ? "text-[#3f52ff] dark:text-white"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {locationType === "virtual" && (
                      <motion.div
                        layoutId="locationTypeIndicator"
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

                {/* Location Content */}
                <div className="bg-card rounded-lg p-3 flex flex-col gap-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-foreground mt-0.5" />
                    <span className="text-base font-medium text-foreground">
                      {t("Add event location", "إضافة موقع الحدث", "Ajouter un lieu")}
                    </span>
                  </div>

                  {locationType === "onsite" ? (
                    <>
                      {/* Location Input */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder={t("Enter the location", "أدخل الموقع", "Entrez le lieu")}
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          className={`h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] ${isArabic ? "text-right" : ""}`}
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-3 h-3 border border-border rounded-full" />
                          <span>
                            {t(
                              "Type to search (Google Typeahead Search integration)",
                              "اكتب للبحث (تكامل بحث جوجل)",
                              "Tapez pour rechercher (intégration Google)"
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Map Placeholder */}
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-muted">
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
                            <div className="w-8 h-8 bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-card rounded-full" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-[#3f52ff]" />
                          </div>
                        </div>
                        {/* Radius Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-[#3f52ff] rounded-full bg-[#3f52ff] dark:bg-[#3f52ff]/10" />
                      </div>

                      {/* Geo-Fence Radius */}
                      <div className="flex flex-col gap-2">
                        <AriaSlider
                          label={t("Geo-Fence Radius", "نطاق السياج الجغرافي", "Rayon de géorepérage")}
                          unit={t("meters", "متر", "mètres")}
                          minValue={0}
                          maxValue={1000}
                          value={geoFenceRadius}
                          onChange={(v) => setGeoFenceRadius(v as number)}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          {t(
                            "Define the radius for location-based check-in verification",
                            "حدد النطاق للتحقق من الحضور حسب الموقع",
                            "Définir le rayon pour la vérification"
                          )}
                        </p>
                      </div>

                      {/* Location Masking */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-foreground">
                              {t("Location Name", "اسم الموقع", "Nom du lieu")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t(
                                "Enter the location name to display on the event",
                                "أدخل اسم الموقع لعرضه في الحدث",
                                "Entrez le nom du lieu à afficher"
                              )}
                            </span>
                          </div>
                          <AriaSwitch
                            isSelected={locationMasking}
                            onChange={setLocationMasking}
                          />
                        </div>

                        {/* Additional Info Textarea */}
                        <textarea
                          placeholder={t("Additional Informations", "معلومات إضافية", "Informations supplémentaires")}
                          value={locationMaskName}
                          onChange={(e) => setLocationMaskName(e.target.value)}
                          className={`w-full h-[72px] px-3 py-2 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] resize-none ${isArabic ? "text-right" : ""}`}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Virtual Meeting URL Input */}
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                            <Link className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <input
                            type="url"
                            placeholder={t("https://docs.google.com/document/d/1UWGMM_Q6NLjZ9m1Kvx-", "https://docs.google.com/document/d/1UWGMM_Q6NLjZ9m1Kvx-", "https://docs.google.com/document/d/1UWGMM_Q6NLjZ9m1Kvx-")}
                            value={virtualMeetingUrl}
                            onChange={(e) => setVirtualMeetingUrl(e.target.value)}
                            className={`w-full h-10 ${isArabic ? "pr-10 pl-10 text-right" : "pl-10 pr-10"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                          />
                          {virtualMeetingUrl && (
                            <div className={`absolute ${isArabic ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}>
                              <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                            </div>
                          )}
                        </div>

                        {/* Additional Info Textarea */}
                        <textarea
                          placeholder={t("Additional Informations", "معلومات إضافية", "Informations supplémentaires")}
                          value={virtualAdditionalInfo}
                          onChange={(e) => setVirtualAdditionalInfo(e.target.value)}
                          className={`w-full h-[72px] px-3 py-2 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] resize-none ${isArabic ? "text-right" : ""}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Event Description */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#3f52ff] dark:text-white">
                  {t("Event Description", "وصف الحدث", "Description de l'événement")}
                </span>
                <div className="bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
                  <textarea
                    placeholder={t("Placeholder", "اكتب وصفاً", "Saisir une description")}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    maxLength={280}
                    className="w-full h-[100px] text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {eventDescription.length}/280 {t("characters", "حرفًا", "caractères")}
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
                <span className="text-sm font-medium text-[#3f52ff] dark:text-white">
                  {t("Additional Options", "خيارات إضافية", "Options supplémentaires")}
                </span>
                <div className="bg-card rounded-lg overflow-hidden">
                  {/* Event Chapter */}
                  <Menu as="div" className="relative">
                    <MenuButton className="w-full px-3 py-2 flex items-center gap-2 border-b border-border hover:bg-background transition-colors">
                      <Tag className="w-4 h-4 text-foreground" />
                      <span className={`text-base font-medium text-foreground flex-1 ${isArabic ? "text-right" : "text-left"}`}>
                        {t("Event Chapter", "الفصل", "Chapitre")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">{chapter}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </MenuButton>
                    <Portal>
                      <MenuItems
                        anchor="bottom end"
                        transition
                        className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[200px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                      >
                        {chapters.map((ch) => (
                          <MenuItem key={ch.id}>
                            <button
                              onClick={() => setChapter(ch.name)}
                              className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${chapter === ch.name
                                ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                }`}
                            >
                              {ch.name}
                            </button>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Portal>
                  </Menu>

                  {/* Tickets Go Live */}
                  <Menu as="div" className="relative">
                    <MenuButton className="w-full px-3 py-2 flex items-center gap-2 border-b border-border hover:bg-background transition-colors">
                      <Ticket className="w-4 h-4 text-foreground" />
                      <span className={`text-base font-medium text-foreground flex-1 ${isArabic ? "text-right" : "text-left"}`}>
                        {t("When tickets should go live?", "متى يجب تفعيل بيع التذاكر؟", "Quand les billets doivent-ils être en vente ?")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {translateTicketGoLive(ticketGoLive)}
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

                  {/* Capacity */}
                  <Menu as="div" className="relative">
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
                </div>
              </div>

              {/* Mobile: Event Preview Card (above CTA) */}
              <div className="lg:hidden w-full bg-card border border-border rounded-lg p-3 flex flex-col gap-4 h-fit">
                {/* Cover Image */}
                <div
                  className="relative w-full h-[264px] rounded-lg overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => {
                    // Trigger the file input from the desktop preview card
                    const fileInput = document.getElementById('event-cover-upload');
                    fileInput?.click();
                  }}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Event cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  {/* Centered Upload Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="34" height="34" rx="17" fill="#3F52FF" />
                      <rect x="1" y="1" width="34" height="34" rx="17" stroke="white" strokeWidth="2" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10.25H17.958C16.589 10.25 15.504 10.25 14.638 10.338C13.75 10.428 13.009 10.618 12.361 11.051C11.8434 11.3985 11.3985 11.8434 11.051 12.361C10.617 13.009 10.428 13.751 10.338 14.638C10.25 15.504 10.25 16.589 10.25 17.958V18.042C10.25 19.411 10.25 20.496 10.338 21.362C10.428 22.25 10.618 22.991 11.051 23.639C11.397 24.158 11.842 24.603 12.361 24.949C13.009 25.383 13.751 25.572 14.638 25.662C15.504 25.75 16.589 25.75 17.958 25.75H18.042C19.411 25.75 20.496 25.75 21.362 25.662C22.25 25.572 22.991 25.382 23.639 24.95C24.1567 24.6023 24.6016 24.157 24.949 23.639C25.383 22.991 25.572 22.249 25.662 21.362C25.75 20.496 25.75 19.411 25.75 18.042V17.958C25.75 16.589 25.75 15.504 25.662 14.638C25.572 13.75 25.382 13.009 24.95 12.361C24.6023 11.8433 24.157 11.3984 23.639 11.051C22.991 10.617 22.249 10.428 21.362 10.338C20.496 10.25 19.411 10.25 18.042 10.25H18ZM20.32 18.785C20.476 18.575 21.055 17.917 21.806 18.385C22.284 18.68 22.686 19.079 23.116 19.505C23.28 19.669 23.396 19.855 23.475 20.054C23.709 20.654 23.587 21.377 23.337 21.972C23.1956 22.3182 22.9808 22.6297 22.7076 22.885C22.4343 23.1403 22.109 23.3334 21.754 23.451C21.4358 23.5517 21.1038 23.602 20.77 23.6H14.87C14.283 23.6 13.764 23.46 13.338 23.197C13.071 23.032 13.024 22.652 13.222 22.406C13.5513 21.9947 13.88 21.5807 14.208 21.164C14.836 20.367 15.259 20.135 15.73 20.338C15.92 20.422 16.112 20.548 16.309 20.681C16.834 21.038 17.564 21.528 18.525 20.996C19.183 20.627 19.565 19.996 19.897 19.445L19.903 19.435L19.973 19.32C20.0805 19.1365 20.1963 18.958 20.32 18.785ZM13.8 15.55C13.8 14.585 14.584 13.8 15.55 13.8C16.0141 13.8 16.4592 13.9844 16.7874 14.3126C17.1156 14.6408 17.3 15.0859 17.3 15.55C17.3 16.0141 17.1156 16.4592 16.7874 16.7874C16.4592 17.1156 16.0141 17.3 15.55 17.3C14.584 17.3 13.8 16.515 13.8 15.55Z" fill="white" />
                    </svg>
                  </div>
                  {/* Hover overlay for changing image */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="34" height="34" rx="17" fill="#3F52FF" />
                      <rect x="1" y="1" width="34" height="34" rx="17" stroke="white" strokeWidth="2" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M18 10.25H17.958C16.589 10.25 15.504 10.25 14.638 10.338C13.75 10.428 13.009 10.618 12.361 11.051C11.8434 11.3985 11.3985 11.8434 11.051 12.361C10.617 13.009 10.428 13.751 10.338 14.638C10.25 15.504 10.25 16.589 10.25 17.958V18.042C10.25 19.411 10.25 20.496 10.338 21.362C10.428 22.25 10.618 22.991 11.051 23.639C11.397 24.158 11.842 24.603 12.361 24.949C13.009 25.383 13.751 25.572 14.638 25.662C15.504 25.75 16.589 25.75 17.958 25.75H18.042C19.411 25.75 20.496 25.75 21.362 25.662C22.25 25.572 22.991 25.382 23.639 24.95C24.1567 24.6023 24.6016 24.157 24.949 23.639C25.383 22.991 25.572 22.249 25.662 21.362C25.75 20.496 25.75 19.411 25.75 18.042V17.958C25.75 16.589 25.75 15.504 25.662 14.638C25.572 13.75 25.382 13.009 24.95 12.361C24.6023 11.8433 24.157 11.3984 23.639 11.051C22.991 10.617 22.249 10.428 21.362 10.338C20.496 10.25 19.411 10.25 18.042 10.25H18ZM20.32 18.785C20.476 18.575 21.055 17.917 21.806 18.385C22.284 18.68 22.686 19.079 23.116 19.505C23.28 19.669 23.396 19.855 23.475 20.054C23.709 20.654 23.587 21.377 23.337 21.972C23.1956 22.3182 22.9808 22.6297 22.7076 22.885C22.4343 23.1403 22.109 23.3334 21.754 23.451C21.4358 23.5517 21.1038 23.602 20.77 23.6H14.87C14.283 23.6 13.764 23.46 13.338 23.197C13.071 23.032 13.024 22.652 13.222 22.406C13.5513 21.9947 13.88 21.5807 14.208 21.164C14.836 20.367 15.259 20.135 15.73 20.338C15.92 20.422 16.112 20.548 16.309 20.681C16.834 21.038 17.564 21.528 18.525 20.996C19.183 20.627 19.565 19.996 19.897 19.445L19.903 19.435L19.973 19.32C20.0805 19.1365 20.1963 18.958 20.32 18.785ZM13.8 15.55C13.8 14.585 14.584 13.8 15.55 13.8C16.0141 13.8 16.4592 13.9844 16.7874 14.3126C17.1156 14.6408 17.3 15.0859 17.3 15.55C17.3 16.0141 17.1156 16.4592 16.7874 16.7874C16.4592 17.1156 16.0141 17.3 15.55 17.3C14.584 17.3 13.8 16.515 13.8 15.55Z" fill="white" />
                    </svg>
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex flex-col gap-4">
                  {/* Title + Badges */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-foreground leading-[18px]">
                      {eventTitle || t("Event name", "اسم الحدث", "Nom de l'événement")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 h-[22px] px-2 bg-[#112755] dark:bg-[#1f2a52] text-white text-xs font-medium rounded">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.8333 7.00002L7.58332 1.75002C7.35832 1.52502 7.04165 1.40002 6.70832 1.40002H2.62499C1.95415 1.40002 1.39999 1.95419 1.39999 2.62502V6.70835C1.39999 7.04168 1.52499 7.35835 1.74999 7.58335L6.99999 12.8334C7.48415 13.3175 8.26582 13.3175 8.74999 12.8334L12.8333 8.75002C13.3175 8.26585 13.3175 7.48419 12.8333 7.00002ZM4.02499 4.95835C3.51165 4.95835 3.09165 4.53835 3.09165 4.02502C3.09165 3.51168 3.51165 3.09168 4.02499 3.09168C4.53832 3.09168 4.95832 3.51168 4.95832 4.02502C4.95832 4.53835 4.53832 4.95835 4.02499 4.95835Z" fill="white" />
                        </svg>
                        {chapter}
                      </span>
                      <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
                        {locationType === "virtual"
                          ? t("Online", "عبر الإنترنت", "En ligne")
                          : t("Onsite", "حضوري", "Sur site")}
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
                          <span className="text-[8px] font-bold text-white/80 uppercase leading-[12px]">
                            {startDate ? (() => {
                              const months = ["JAN.", "FÉV.", "MAR.", "AVR.", "MAI.", "JUI.", "JUL.", "AOÛ.", "SEP.", "OCT.", "NOV.", "DÉC."];
                              return months[startDate.month - 1];
                            })() : "OCT."}
                          </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-base font-medium text-muted-foreground leading-none">{startDate?.day || "25"}</span>
                        </div>
                      </div>
                      {/* Date Text */}
                      <div className="flex flex-col gap-px">
                        <span className="text-base font-medium text-foreground leading-[24px]">
                          {formatDateForDisplay(startDate)}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground leading-[21px]">
                          {startTime} - {endTime} {timezoneOffset}
                        </span>
                      </div>
                    </div>

                    {/* Venue Section */}
                    <div className="flex items-center gap-2">
                      {/* Location Icon Box */}
                      <div className="w-10 h-10 border border-border rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-foreground leading-[24px]">
                          {locationInput ? locationInput.split(",")[0] : t("Venue", "الموقع", "Lieu")}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground leading-[21px]">
                          {locationInput ? locationInput.split(",").slice(1, 3).join(",").trim() || t("Dubai, Dubai", "دبي، دبي", "Dubai, Dubai") : t("Dubai, Dubai", "دبي، دبي", "Dubai, Dubai")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Event Button */}
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full h-10 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] dark:hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("Creating...", "جارٍ الإنشاء...", "Création...")}
                  </>
                ) : (
                  t("+ Create Event", "+ إنشاء حدث", "+ Créer un événement")
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Timezone Modal */}
      {showTimezoneModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTimezoneModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative bg-card border border-border rounded-xl w-[min(560px,calc(100vw-2rem))] max-h-[80vh] flex flex-col ${isArabic ? "font-ko-sans-ar" : ""}`}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-base font-semibold text-foreground">Select Time Zone</span>
              <button
                type="button"
                onClick={() => setShowTimezoneModal(false)}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pt-3 pb-4 flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-2 h-9 px-3 py-1 bg-muted border border-border rounded-lg">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={timezoneQuery}
                  onChange={(e) => setTimezoneQuery(e.target.value)}
                  placeholder="Search time zones..."
                  className="w-full bg-transparent text-sm text-foreground outline-none border-none p-0"
                />
              </div>
              <div className="flex-1 overflow-auto pr-1">
                {timezoneGroups.length > 0 ? (
                  timezoneGroups.map(([continent, items]) => (
                    <div key={continent} className="py-1">
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {continent}
                      </div>
                      <div className="flex flex-col">
                        {items.map((tz) => (
                          <button
                            key={tz}
                            type="button"
                            onClick={() => {
                              setTimezone(tz);
                              setTimezoneQuery("");
                              setShowTimezoneModal(false);
                            }}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none ${timezone === tz
                              ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                              : "text-foreground hover:bg-muted"
                              }`}
                          >
                            {tz}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">No matching time zones</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
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
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="px-4 py-4 flex flex-col gap-4">
              {/* League Name Inputs - Side by Side */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label htmlFor="league-name-en" className="text-sm font-semibold text-foreground">
                    League Name (English)
                  </label>
                  <input
                    id="league-name-en"
                    type="text"
                    placeholder={t("Enter league name", "أدخل اسم الدوري", "Entrez le nom de la ligue")}
                    value={newLeagueName}
                    onChange={(e) => setNewLeagueName(e.target.value)}
                    className={`w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] ${isArabic ? "text-right font-ko-sans-ar" : ""}`}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label htmlFor="league-name-ar" className="text-sm font-semibold text-foreground text-right font-ko-sans-ar">
                    اسم الدوري (العربية)
                  </label>
                  <input
                    id="league-name-ar"
                    type="text"
                    placeholder="أدخل اسم الدوري"
                    dir="rtl"
                    value={newLeagueNameAr}
                    onChange={(e) => setNewLeagueNameAr(e.target.value)}
                    className="w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                  />
                </div>
              </div>

              {/* League Logo */}
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

                {/* Website URL */}
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

              {/* Visible in league selection checkbox */}
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

            {/* Modal Footer */}
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
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="px-4 py-4 flex flex-col gap-4">
              {/* League Select */}
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

              {/* Team Name Inputs */}
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

              {/* Team Logo */}
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

                {/* Website URL */}
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

              {/* Stadium Name Inputs */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Stadium Name
                  </label>
                  <div className="relative">
                    <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder={t("Enter stadium name", "أدخل اسم الملعب", "Entrez le nom du stade")}
                      value={newTeamStadium}
                      onChange={(e) => setNewTeamStadium(e.target.value)}
                      className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right font-ko-sans-ar" : "pl-10 pr-3"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground text-right font-ko-sans-ar">
                    اسم الملعب
                  </label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder="أدخل اسم الملعب"
                      dir="rtl"
                      value={newTeamStadiumAr}
                      onChange={(e) => setNewTeamStadiumAr(e.target.value)}
                      className="w-full h-9 pr-10 pl-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                    />
                  </div>
                </div>
              </div>

              {/* Manager Name Inputs */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Manager Name
                  </label>
                  <div className="relative">
                    <div className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}>
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder={t("Enter manager name", "أدخل اسم المدير", "Entrez le nom du manager")}
                      value={newTeamManager}
                      onChange={(e) => setNewTeamManager(e.target.value)}
                      className={`w-full h-9 ${isArabic ? "pr-10 pl-3 text-right font-ko-sans-ar" : "pl-10 pr-3"} border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff]`}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground text-right font-ko-sans-ar">
                    اسم المدير
                  </label>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder="أدخل اسم المدير"
                      dir="rtl"
                      value={newTeamManagerAr}
                      onChange={(e) => setNewTeamManagerAr(e.target.value)}
                      className="w-full h-9 pr-10 pl-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                    />
                  </div>
                </div>
              </div>

              {/* Visible in team selection checkbox */}
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
                  {t("Visible in team selection", "مرئي في اختيار الفريق", "Visible dans la sélection de l'équipe")}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
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
    </div>
  );
}
