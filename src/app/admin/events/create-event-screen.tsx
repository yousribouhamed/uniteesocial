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
  Link,
  CheckCircle,
  ClipboardPenLine,
  ArrowUpRight,
  Info,
  X,
  Upload,
  Link2,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
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

  const [language, setLanguage] = useState<"English" | "French" | "Arabic">("English");
  const isArabic = language === "Arabic";
  const t = (english: string, arabic?: string, french?: string) => {
    if (language === "Arabic") return arabic ?? english;
    if (language === "French") return french ?? english;
    return english;
  };
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
  const isMatchEvent = eventCategory === "match";

  return (
    <div className={`bg-muted border border-border rounded-lg p-4 pb-2 flex flex-col gap-4 ${isArabic ? "font-ko-sans-ar" : ""}`}>
      <div className="flex lg:flex-row flex-col gap-4 items-start">
        {/* Left: Event Preview Card */}
        <div className="hidden lg:flex w-full lg:w-[493px] shrink-0 bg-card border border-border rounded-lg p-3 flex-col gap-4 h-fit">
          {/* Cover Image */}
          <div
            className="relative w-full h-[264px] rounded-lg overflow-hidden bg-muted cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
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
            {/* Centered Camera Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full border-[2.889px] border-white flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {/* Hover overlay for changing image */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
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
                  <span className="inline-flex items-center h-[22px] px-2 bg-[#3f52ff] dark:bg-[#3f52ff] text-white text-xs font-medium rounded">
                    {matchLocationType === "virtual"
                      ? t("Virtual", "افتراضي", "Virtuel")
                      : t("Onsite", "حضوري", "Sur site")}
                  </span>
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
            </div>

            {/* Date & Venue Row */}
            <div className="flex items-start gap-8 flex-wrap">
              {/* Date Section */}
              <div className="flex items-center gap-2">
                {/* Date Box */}
                <div className="w-10 h-11 border border-border rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-muted-foreground/40 px-0.5 py-1 flex items-center justify-center">
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
                      {locationMasking && locationMaskName ? locationMaskName : (locationInput ? locationInput.split(",")[0] : "Lieu")}
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
          <div className="flex items-center justify-between">
            {/* Event Type Tabs */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setEventCategory("general")}
                className={`relative h-9 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${eventCategory === "general"
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
                className={`relative h-9 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${eventCategory === "match"
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
            <div className="w-[100px]">
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
                              className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${
                                league === l
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
                <div className="flex gap-2">
                  {/* Home Team */}
                  <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-base font-medium text-foreground">
                      {t("Home Team", "الفريق المضيف", "Équipe à domicile")}<span className="text-destructive">*</span>
                    </span>
                    <Menu as="div" className="relative">
                      <MenuButton className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
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
                              onClick={() => {/* Handle create team */}}
                              className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                            </button>
                          </MenuItem>
                          {["Al-Hilal", "Etihad Jeddah", "Al-Nassr"].map((t) => (
                            <MenuItem key={t}>
                              <button
                                onClick={() => setHomeTeam(t)}
                                className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${
                                  homeTeam === t
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
                  <div className="flex-1 bg-card rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-base font-medium text-foreground">
                      {t("Away Team", "الفريق الضيف", "Équipe à l'extérieur")}<span className="text-destructive">*</span>
                    </span>
                    <Menu as="div" className="relative">
                      <MenuButton className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
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
                              onClick={() => {/* Handle create team */}}
                              className="flex w-full h-8 px-2 py-[6px] rounded-t-lg rounded-b items-center bg-blue-100 dark:bg-blue-950/40 text-sm font-medium text-[#3f52ff] dark:text-white transition-colors focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              {t("+ Create Team", "+ إنشاء فريق", "+ Créer une équipe")}
                            </button>
                          </MenuItem>
                          {["Al-Hilal", "Etihad Jeddah", "Al-Nassr"].map((t) => (
                            <MenuItem key={t}>
                              <button
                                onClick={() => setAwayTeam(t)}
                                className={`flex w-full h-8 px-2 py-[6px] rounded items-center text-sm font-medium transition-colors focus:outline-none ${
                                  awayTeam === t
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
              <div className="flex gap-2">
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
                <div className="bg-card rounded-lg w-[140px] p-2 flex flex-col gap-1 shrink-0">
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
                <div className="bg-card rounded-lg px-3 py-2 flex items-center gap-2">
                  <button
                    onClick={() => setEnableLineUpAnnouncement(!enableLineUpAnnouncement)}
                    className={`w-4 h-4 border rounded shrink-0 flex items-center justify-center ${
                      enableLineUpAnnouncement
                        ? "bg-[#3f52ff] dark:bg-[#3f52ff] border-[#3f52ff]"
                        : "bg-card border-border"
                    }`}
                  >
                    {enableLineUpAnnouncement && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-base font-medium text-foreground flex-1">
                    {t("Enable Line-Up Announcement", "تفعيل إعلان التشكيلة", "Activer l'annonce de composition")}
                  </span>

                  {/* Timing Dropdown - Only shown when enabled */}
                  {enableLineUpAnnouncement && (
                    <Menu as="div" className="relative">
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
                              className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${
                                lineUpAnnouncementTime === time
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
                <div className="flex items-center bg-muted rounded-lg p-[6px] w-full">
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
                          className={`relative w-[42px] h-[24px] rounded-full transition-colors ${
                            matchLocationMasking ? "bg-[#3f52ff] dark:bg-[#3f52ff]" : "bg-muted"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-[16px] h-[16px] bg-card rounded-full shadow transition-all ${
                              matchLocationMasking ? "left-[22px]" : "left-1"
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
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-border">
                    <Users className="w-4 h-4 text-foreground" />
                    <span className="text-base font-medium text-foreground flex-1">
                      {t("Capacity", "السعة", "Capacité")}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground">{capacity}</span>
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

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
                              className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${
                                ticketGoLive === option
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
              <div className="bg-card rounded-lg w-full sm:w-[140px] p-2 flex flex-col gap-1 shrink-0">
                <Globe className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">GMT+01:00</span>
                  <span className="text-xs font-normal text-muted-foreground">Algiers</span>
                </div>
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
            <div className="flex items-center bg-muted rounded-lg p-[6px] w-full">
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
                    {DEFAULT_CHAPTERS.map((ch) => (
                      <MenuItem key={ch.code}>
                        <button
                          onClick={() => setChapter(ch.name)}
                          className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${
                            chapter === ch.name
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
                        className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${
                          ticketGoLive === option
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
                          className={`flex w-full px-2 py-[6px] rounded text-sm font-medium transition-colors focus:outline-none ${
                            capacity === option
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
              onClick={() => fileInputRef.current?.click()}
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
              {/* Centered Camera Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] bg-[#3f52ff] dark:bg-[#3f52ff] rounded-full border-[2.889px] border-white flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              {/* Hover overlay for changing image */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
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
                    <div className="bg-muted-foreground/40 px-0.5 py-1 flex items-center justify-center">
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
                      {startTime} - {endTime} UTC+4
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

      {/* Create League Modal */}
      {showCreateLeagueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div
            className={`bg-card border border-border rounded-xl w-[493px] flex flex-col ${isArabic ? "font-ko-sans-ar" : ""}`}
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
                <input
                  type="text"
                  placeholder={t("Enter league name", "أدخل اسم الدوري", "Entrez le nom de la ligue")}
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className={`flex-1 h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] ${isArabic ? "text-right font-ko-sans-ar" : ""}`}
                />
                <input
                  type="text"
                  placeholder="أدخل اسم الدوري"
                  dir="rtl"
                  value={newLeagueNameAr}
                  onChange={(e) => setNewLeagueNameAr(e.target.value)}
                  className="flex-1 h-9 px-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] font-ko-sans-ar"
                />
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
                  className={`w-4 h-4 rounded shrink-0 flex items-center justify-center shadow-sm ${
                    newLeagueVisible
                      ? "bg-[#3f52ff] dark:bg-[#3f52ff]"
                      : "bg-card border border-border"
                  }`}
                >
                  {newLeagueVisible && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          </div>
        </div>
      )}
    </div>
  );
}
