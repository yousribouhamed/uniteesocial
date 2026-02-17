"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type DragEvent, type Dispatch, type SetStateAction } from "react";
import { createClient } from "@/lib/supabase/client";
import { AriaSwitch } from "@/components/ui/aria-switch";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import {
  Bell,
  Building2,
  ChevronRight,
  Upload,
  User,
  Copy,
  Pipette,
  ChevronDown,
  Link2,
  Linkedin,
  Instagram,
  Tags,
  Tag,
  Eye,
  Search,
  ChevronsUpDown,
  MoreVertical,
  Plus,
  Info,
  MapPin,
  CircleUserRound,
  X,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronUp,
  ExternalLink,
  Loader2,
  Calendar, // Added for ModuleItem
  Ticket, // Added for ModuleItem
  CalendarDays, // Added for ModuleItem
  MessageSquare, // Added for ModuleItem
  Users, // Added for ModuleItem
} from "lucide-react";
import AdminSidebar, { type CurrentUser } from "@/components/admin-sidebar";
import { toastQueue } from "@/components/ui/aria-toast";

import { getBusinessProfile, updateBusinessProfile, uploadBrandAsset, uploadChapterCover, getChapters, updateChapterVisibility, deleteChapter as deleteChapterAction } from "./actions";
import { TIMEZONES } from "@/data/timezones";

interface BusinessProfileClientProps {
  currentUser: CurrentUser;
}

interface ProfileData {
  id?: string;
  business_name?: string;
  poc_email?: string;
  poc_name?: string;
  timezone?: string;
  domain?: string;
  colors?: any;
  modules?: any;
  social_links?: any;
  terms_url?: string;
  privacy_url?: string;
}

const COUNTRY_OPTIONS = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const PHONE_COUNTRIES = [
  { name: "Afghanistan", iso2: "AF", dial: "93" },
  { name: "Albania", iso2: "AL", dial: "355" },
  { name: "Algeria", iso2: "DZ", dial: "213" },
  { name: "Andorra", iso2: "AD", dial: "376" },
  { name: "Angola", iso2: "AO", dial: "244" },
  { name: "Antigua and Barbuda", iso2: "AG", dial: "1" },
  { name: "Argentina", iso2: "AR", dial: "54" },
  { name: "Armenia", iso2: "AM", dial: "374" },
  { name: "Australia", iso2: "AU", dial: "61" },
  { name: "Austria", iso2: "AT", dial: "43" },
  { name: "Azerbaijan", iso2: "AZ", dial: "994" },
  { name: "Bahamas", iso2: "BS", dial: "1" },
  { name: "Bahrain", iso2: "BH", dial: "973" },
  { name: "Bangladesh", iso2: "BD", dial: "880" },
  { name: "Barbados", iso2: "BB", dial: "1" },
  { name: "Belarus", iso2: "BY", dial: "375" },
  { name: "Belgium", iso2: "BE", dial: "32" },
  { name: "Belize", iso2: "BZ", dial: "501" },
  { name: "Benin", iso2: "BJ", dial: "229" },
  { name: "Bhutan", iso2: "BT", dial: "975" },
  { name: "Bolivia", iso2: "BO", dial: "591" },
  { name: "Bosnia and Herzegovina", iso2: "BA", dial: "387" },
  { name: "Botswana", iso2: "BW", dial: "267" },
  { name: "Brazil", iso2: "BR", dial: "55" },
  { name: "Brunei", iso2: "BN", dial: "673" },
  { name: "Bulgaria", iso2: "BG", dial: "359" },
  { name: "Burkina Faso", iso2: "BF", dial: "226" },
  { name: "Burundi", iso2: "BI", dial: "257" },
  { name: "Cabo Verde", iso2: "CV", dial: "238" },
  { name: "Cambodia", iso2: "KH", dial: "855" },
  { name: "Cameroon", iso2: "CM", dial: "237" },
  { name: "Canada", iso2: "CA", dial: "1" },
  { name: "Central African Republic", iso2: "CF", dial: "236" },
  { name: "Chad", iso2: "TD", dial: "235" },
  { name: "Chile", iso2: "CL", dial: "56" },
  { name: "China", iso2: "CN", dial: "86" },
  { name: "Colombia", iso2: "CO", dial: "57" },
  { name: "Comoros", iso2: "KM", dial: "269" },
  { name: "Congo (Congo-Brazzaville)", iso2: "CG", dial: "242" },
  { name: "Costa Rica", iso2: "CR", dial: "506" },
  { name: "Croatia", iso2: "HR", dial: "385" },
  { name: "Cuba", iso2: "CU", dial: "53" },
  { name: "Cyprus", iso2: "CY", dial: "357" },
  { name: "Czechia", iso2: "CZ", dial: "420" },
  { name: "Democratic Republic of the Congo", iso2: "CD", dial: "243" },
  { name: "Denmark", iso2: "DK", dial: "45" },
  { name: "Djibouti", iso2: "DJ", dial: "253" },
  { name: "Dominica", iso2: "DM", dial: "1" },
  { name: "Dominican Republic", iso2: "DO", dial: "1" },
  { name: "Ecuador", iso2: "EC", dial: "593" },
  { name: "Egypt", iso2: "EG", dial: "20" },
  { name: "El Salvador", iso2: "SV", dial: "503" },
  { name: "Equatorial Guinea", iso2: "GQ", dial: "240" },
  { name: "Eritrea", iso2: "ER", dial: "291" },
  { name: "Estonia", iso2: "EE", dial: "372" },
  { name: "Eswatini", iso2: "SZ", dial: "268" },
  { name: "Ethiopia", iso2: "ET", dial: "251" },
  { name: "Fiji", iso2: "FJ", dial: "679" },
  { name: "Finland", iso2: "FI", dial: "358" },
  { name: "France", iso2: "FR", dial: "33" },
  { name: "Gabon", iso2: "GA", dial: "241" },
  { name: "Gambia", iso2: "GM", dial: "220" },
  { name: "Georgia", iso2: "GE", dial: "995" },
  { name: "Germany", iso2: "DE", dial: "49" },
  { name: "Ghana", iso2: "GH", dial: "233" },
  { name: "Greece", iso2: "GR", dial: "30" },
  { name: "Grenada", iso2: "GD", dial: "1" },
  { name: "Guatemala", iso2: "GT", dial: "502" },
  { name: "Guinea", iso2: "GN", dial: "224" },
  { name: "Guinea-Bissau", iso2: "GW", dial: "245" },
  { name: "Guyana", iso2: "GY", dial: "592" },
  { name: "Haiti", iso2: "HT", dial: "509" },
  { name: "Honduras", iso2: "HN", dial: "504" },
  { name: "Hungary", iso2: "HU", dial: "36" },
  { name: "Iceland", iso2: "IS", dial: "354" },
  { name: "India", iso2: "IN", dial: "91" },
  { name: "Indonesia", iso2: "ID", dial: "62" },
  { name: "Iran", iso2: "IR", dial: "98" },
  { name: "Iraq", iso2: "IQ", dial: "964" },
  { name: "Ireland", iso2: "IE", dial: "353" },
  { name: "Israel", iso2: "IL", dial: "972" },
  { name: "Italy", iso2: "IT", dial: "39" },
  { name: "Jamaica", iso2: "JM", dial: "1" },
  { name: "Japan", iso2: "JP", dial: "81" },
  { name: "Jordan", iso2: "JO", dial: "962" },
  { name: "Kazakhstan", iso2: "KZ", dial: "7" },
  { name: "Kenya", iso2: "KE", dial: "254" },
  { name: "Kiribati", iso2: "KI", dial: "686" },
  { name: "Kuwait", iso2: "KW", dial: "965" },
  { name: "Kyrgyzstan", iso2: "KG", dial: "996" },
  { name: "Laos", iso2: "LA", dial: "856" },
  { name: "Latvia", iso2: "LV", dial: "371" },
  { name: "Lebanon", iso2: "LB", dial: "961" },
  { name: "Lesotho", iso2: "LS", dial: "266" },
  { name: "Liberia", iso2: "LR", dial: "231" },
  { name: "Libya", iso2: "LY", dial: "218" },
  { name: "Liechtenstein", iso2: "LI", dial: "423" },
  { name: "Lithuania", iso2: "LT", dial: "370" },
  { name: "Luxembourg", iso2: "LU", dial: "352" },
  { name: "Madagascar", iso2: "MG", dial: "261" },
  { name: "Malawi", iso2: "MW", dial: "265" },
  { name: "Malaysia", iso2: "MY", dial: "60" },
  { name: "Maldives", iso2: "MV", dial: "960" },
  { name: "Mali", iso2: "ML", dial: "223" },
  { name: "Malta", iso2: "MT", dial: "356" },
  { name: "Marshall Islands", iso2: "MH", dial: "692" },
  { name: "Mauritania", iso2: "MR", dial: "222" },
  { name: "Mauritius", iso2: "MU", dial: "230" },
  { name: "Mexico", iso2: "MX", dial: "52" },
  { name: "Micronesia", iso2: "FM", dial: "691" },
  { name: "Moldova", iso2: "MD", dial: "373" },
  { name: "Monaco", iso2: "MC", dial: "377" },
  { name: "Mongolia", iso2: "MN", dial: "976" },
  { name: "Montenegro", iso2: "ME", dial: "382" },
  { name: "Morocco", iso2: "MA", dial: "212" },
  { name: "Mozambique", iso2: "MZ", dial: "258" },
  { name: "Myanmar", iso2: "MM", dial: "95" },
  { name: "Namibia", iso2: "NA", dial: "264" },
  { name: "Nauru", iso2: "NR", dial: "674" },
  { name: "Nepal", iso2: "NP", dial: "977" },
  { name: "Netherlands", iso2: "NL", dial: "31" },
  { name: "New Zealand", iso2: "NZ", dial: "64" },
  { name: "Nicaragua", iso2: "NI", dial: "505" },
  { name: "Niger", iso2: "NE", dial: "227" },
  { name: "Nigeria", iso2: "NG", dial: "234" },
  { name: "North Korea", iso2: "KP", dial: "850" },
  { name: "North Macedonia", iso2: "MK", dial: "389" },
  { name: "Norway", iso2: "NO", dial: "47" },
  { name: "Oman", iso2: "OM", dial: "968" },
  { name: "Pakistan", iso2: "PK", dial: "92" },
  { name: "Palau", iso2: "PW", dial: "680" },
  { name: "Panama", iso2: "PA", dial: "507" },
  { name: "Papua New Guinea", iso2: "PG", dial: "675" },
  { name: "Paraguay", iso2: "PY", dial: "595" },
  { name: "Peru", iso2: "PE", dial: "51" },
  { name: "Philippines", iso2: "PH", dial: "63" },
  { name: "Poland", iso2: "PL", dial: "48" },
  { name: "Portugal", iso2: "PT", dial: "351" },
  { name: "Qatar", iso2: "QA", dial: "974" },
  { name: "Romania", iso2: "RO", dial: "40" },
  { name: "Russia", iso2: "RU", dial: "7" },
  { name: "Rwanda", iso2: "RW", dial: "250" },
  { name: "Saint Kitts and Nevis", iso2: "KN", dial: "1" },
  { name: "Saint Lucia", iso2: "LC", dial: "1" },
  { name: "Saint Vincent and the Grenadines", iso2: "VC", dial: "1" },
  { name: "Samoa", iso2: "WS", dial: "685" },
  { name: "San Marino", iso2: "SM", dial: "378" },
  { name: "Sao Tome and Principe", iso2: "ST", dial: "239" },
  { name: "Saudi Arabia", iso2: "SA", dial: "966" },
  { name: "Senegal", iso2: "SN", dial: "221" },
  { name: "Serbia", iso2: "RS", dial: "381" },
  { name: "Seychelles", iso2: "SC", dial: "248" },
  { name: "Sierra Leone", iso2: "SL", dial: "232" },
  { name: "Singapore", iso2: "SG", dial: "65" },
  { name: "Slovakia", iso2: "SK", dial: "421" },
  { name: "Slovenia", iso2: "SI", dial: "386" },
  { name: "Solomon Islands", iso2: "SB", dial: "677" },
  { name: "Somalia", iso2: "SO", dial: "252" },
  { name: "South Africa", iso2: "ZA", dial: "27" },
  { name: "South Korea", iso2: "KR", dial: "82" },
  { name: "South Sudan", iso2: "SS", dial: "211" },
  { name: "Spain", iso2: "ES", dial: "34" },
  { name: "Sri Lanka", iso2: "LK", dial: "94" },
  { name: "Sudan", iso2: "SD", dial: "249" },
  { name: "Suriname", iso2: "SR", dial: "597" },
  { name: "Sweden", iso2: "SE", dial: "46" },
  { name: "Switzerland", iso2: "CH", dial: "41" },
  { name: "Syria", iso2: "SY", dial: "963" },
  { name: "Taiwan", iso2: "TW", dial: "886" },
  { name: "Tajikistan", iso2: "TJ", dial: "992" },
  { name: "Tanzania", iso2: "TZ", dial: "255" },
  { name: "Thailand", iso2: "TH", dial: "66" },
  { name: "Timor-Leste", iso2: "TL", dial: "670" },
  { name: "Togo", iso2: "TG", dial: "228" },
  { name: "Tonga", iso2: "TO", dial: "676" },
  { name: "Trinidad and Tobago", iso2: "TT", dial: "1" },
  { name: "Tunisia", iso2: "TN", dial: "216" },
  { name: "Turkey", iso2: "TR", dial: "90" },
  { name: "Turkmenistan", iso2: "TM", dial: "993" },
  { name: "Tuvalu", iso2: "TV", dial: "688" },
  { name: "Uganda", iso2: "UG", dial: "256" },
  { name: "Ukraine", iso2: "UA", dial: "380" },
  { name: "United Arab Emirates", iso2: "AE", dial: "971" },
  { name: "United Kingdom", iso2: "GB", dial: "44" },
  { name: "United States", iso2: "US", dial: "1" },
  { name: "Uruguay", iso2: "UY", dial: "598" },
  { name: "Uzbekistan", iso2: "UZ", dial: "998" },
  { name: "Vanuatu", iso2: "VU", dial: "678" },
  { name: "Vatican City", iso2: "VA", dial: "379" },
  { name: "Venezuela", iso2: "VE", dial: "58" },
  { name: "Vietnam", iso2: "VN", dial: "84" },
  { name: "Yemen", iso2: "YE", dial: "967" },
  { name: "Zambia", iso2: "ZM", dial: "260" },
  { name: "Zimbabwe", iso2: "ZW", dial: "263" },
];

const flagFor = (iso2: string) =>
  iso2
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");

const COUNTRY_ISO_LOOKUP = Object.fromEntries(
  PHONE_COUNTRIES.map((c) => [c.name, c.iso2])
);

const COUNTRY_SELECT_OPTIONS = COUNTRY_OPTIONS.map((name) => ({
  value: name,
  label: name,
  iso2: COUNTRY_ISO_LOOKUP[name],
}));

type SelectOption = {
  value: string;
  label: string;
  iso2?: string;
};

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-9 px-3 bg-card border border-border rounded-lg flex items-center gap-2 text-sm text-left"
      >
        <span className="text-sm">
          {selected?.iso2 ? flagFor(selected.iso2) : "🏳️"}
        </span>
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="ml-auto w-4 h-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 h-8 px-2 border border-border rounded-md">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
              >
                <span className="w-6">
                  {option.iso2 ? flagFor(option.iso2) : "🏳️"}
                </span>
                <span className="flex-1 text-left">{option.label}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const topTabs = ["Tenant Setup", "Social Links", "Legal and T&C", "Chapters"] as const;
type TopTab = (typeof topTabs)[number];

const innerTabs = ["General Setting", "Branding", "Modules"] as const;
type InnerTab = (typeof innerTabs)[number];

export default function BusinessProfileClient({ currentUser }: BusinessProfileClientProps) {
  const [activeTopTab, setActiveTopTab] = useState<TopTab>("Tenant Setup");
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>("General Setting");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const refreshProfile = useCallback(async () => {
    const data = await getBusinessProfile();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="flex min-h-screen w-full max-w-full bg-background font-[family-name:'Instrument_Sans',sans-serif] text-foreground">
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
                <Building2 className="w-4 h-4 inline mr-1" />
              </span>
              <span className="text-muted-foreground font-medium px-1 py-0.5">Business Profile</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium px-1 py-0.5">General Settings</span>
            </nav>
          </div>
          <div className="bg-muted rounded-full p-[7px]">
            <Bell className="w-[17px] h-[17px] text-foreground" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 min-w-0">
          <div className="flex flex-col gap-2">
            {/* Top Tabs - Tenant Setup, Social Links, Legal and T&C, Chapters */}
            <div className="flex items-center bg-[#ECEFF2] border-0 dark:bg-muted rounded-lg p-1 relative self-start overflow-x-auto whitespace-nowrap hide-scrollbar">
              {topTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTopTab(tab)}
                  className={`relative h-9 px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors z-10 ${activeTopTab === tab
                    ? "text-[#3f52ff] dark:text-white"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {activeTopTab === tab && (
                    <motion.div
                      layoutId="topTabIndicator"
                      className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTopTab === "Tenant Setup" && (
              <div className="bg-[#ECEFF2] border border-[#D5DDE2] dark:bg-muted dark:border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
                {/* Section Header */}
                <div className="flex flex-col gap-2 px-2">
                  <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
                    About Business
                  </h1>
                  <p className="text-base font-semibold text-muted-foreground leading-[18px]">
                    Configure your business information and settings
                  </p>
                </div>

                {/* Inner Tabs - General Setting, Branding, Modules */}
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center bg-[#ECEFF2] border-0 dark:bg-muted rounded-lg p-1 relative self-start w-max overflow-x-auto whitespace-nowrap">
                    {innerTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveInnerTab(tab)}
                        className={`relative h-9 px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors z-10 ${activeInnerTab === tab
                          ? "text-[#3f52ff] dark:text-white"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {activeInnerTab === tab && (
                          <motion.div
                            layoutId="innerTabIndicator"
                            className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">{tab}</span>
                      </button>
                    ))}
                  </div>

                  {/* Content Card - General Setting */}
                  {activeInnerTab === "General Setting" && (
                    <GeneralSettingContent initialData={profile} refreshProfile={refreshProfile} />
                  )}

                  {/* Content Card - Branding */}
                  {activeInnerTab === "Branding" && (
                    <BrandingContent initialData={profile} refreshProfile={refreshProfile} />
                  )}

                  {/* Content Card - Modules */}
                  {activeInnerTab === "Modules" && (
                    <ModulesContent initialData={profile?.modules} refreshProfile={refreshProfile} />
                  )}
                </div>
              </div>
            )}

            {activeTopTab === "Social Links" && (
              <SocialLinksContent initialData={profile?.social_links} refreshProfile={refreshProfile} />
            )}

            {activeTopTab === "Legal and T&C" && (
              <LegalAndTCContent initialData={profile} refreshProfile={refreshProfile} />
            )}

            {activeTopTab === "Chapters" && (
              <ChaptersContent />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- HSV/RGB/HEX Conversion Helpers ---
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function hexToHsv(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 1, 1];
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

// --- Color Picker Component ---
function ColorPicker({
  color,
  onChange,
  onClose,
}: {
  color: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(color));
  const [opacity, setOpacity] = useState(100);
  const [mode, setMode] = useState<"HEX" | "RGB">("HEX");
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [rgbInput, setRgbInput] = useState(() => hsvToRgb(hsv[0], hsv[1], hsv[2]));
  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      // Check if click is inside the picker
      if (pickerRef.current && pickerRef.current.contains(target)) {
        return;
      }
      // Check if click is inside a Headless UI portal (menu items)
      // Look for elements with data-headlessui-state or inside [data-headlessui-portal]
      const portalElement = (target as Element).closest?.('[data-headlessui-portal], [data-headlessui-state], [role="menu"], [role="menuitem"]');
      if (portalElement) {
        return;
      }
      onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const updateFromHsv = useCallback((h: number, s: number, v: number) => {
    setHsv([h, s, v]);
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    setHexInput(hex);
    setRgbInput(rgb);
    onChange(hex);
  }, [onChange]);

  const handleAreaMouseDown = (e: React.MouseEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const update = (clientX: number, clientY: number) => {
      const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
      updateFromHsv(hsv[0], s, v);
    };
    update(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => update(ev.clientX, ev.clientY);
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const update = (clientX: number) => {
      const h = Math.max(0, Math.min(360, (clientX - rect.left) / rect.width * 360));
      updateFromHsv(h, hsv[1], hsv[2]);
    };
    update(e.clientX);
    const onMove = (ev: MouseEvent) => update(ev.clientX);
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleOpacityMouseDown = (e: React.MouseEvent) => {
    const rect = opacityRef.current?.getBoundingClientRect();
    if (!rect) return;
    const update = (clientX: number) => {
      const o = Math.max(0, Math.min(100, Math.round((clientX - rect.left) / rect.width * 100)));
      setOpacity(o);
    };
    update(e.clientX);
    const onMove = (ev: MouseEvent) => update(ev.clientX);
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const newHsv = hexToHsv(val);
      setHsv(newHsv);
      const rgb = hsvToRgb(newHsv[0], newHsv[1], newHsv[2]);
      setRgbInput(rgb);
      onChange(val.toUpperCase());
    }
  };

  const handleRgbChange = (index: number, val: string) => {
    // Allow empty string for typing
    if (val === "") {
      const newRgb = [...rgbInput] as [number, number, number];
      newRgb[index] = 0;
      setRgbInput(newRgb);
      return;
    }

    // Only allow numeric input
    if (!/^\d*$/.test(val)) return;

    const num = parseInt(val, 10);
    if (isNaN(num)) return;

    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = [...rgbInput] as [number, number, number];
    newRgb[index] = clamped;
    setRgbInput(newRgb);

    const newHsv = rgbToHsv(newRgb[0], newRgb[1], newRgb[2]);
    setHsv(newHsv);
    const hex = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    setHexInput(hex);
    onChange(hex);
  };

  // Update RGB input when mode changes to RGB to ensure sync
  useEffect(() => {
    if (mode === "RGB") {
      setRgbInput(hsvToRgb(hsv[0], hsv[1], hsv[2]));
    }
  }, [mode, hsv]);

  const [r, g, b] = hsvToRgb(hsv[0], 1, 1);
  const hueColor = `rgb(${r},${g},${b})`;

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-3.5 w-[340px]"
    >
      {/* Saturation/Brightness Area */}
      <div
        ref={areaRef}
        className="relative w-full h-[200px] rounded cursor-crosshair"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})` }}
        onMouseDown={handleAreaMouseDown}
      >
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-[0px_0px_0px_1px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${hsv[1] * 100}%`,
            top: `${(1 - hsv[2]) * 100}%`,
          }}
        />
      </div>

      {/* Eyedropper + Sliders */}
      <div className="flex items-center gap-3.5">
        <button className="w-8 h-8 rounded-lg border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0 hover:bg-muted/70 transition-colors">
          <Pipette className="w-3.5 h-3.5 text-foreground" />
        </button>
        <div className="flex-1 flex flex-col gap-1">
          {/* Hue Slider */}
          <div
            ref={hueRef}
            className="relative h-3.5 cursor-pointer"
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute inset-y-[3px] left-0 right-0 rounded-full"
              style={{ background: "linear-gradient(to right, #ff0000, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000)" }}
            />
            <div
              className="absolute top-0 w-3.5 h-3.5 rounded-full bg-card border border-[rgba(24,24,29,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] -translate-x-1/2 pointer-events-none"
              style={{ left: `${(hsv[0] / 360) * 100}%` }}
            />
          </div>
          {/* Opacity Slider */}
          <div
            ref={opacityRef}
            className="relative h-3.5 cursor-pointer"
            onMouseDown={handleOpacityMouseDown}
          >
            <div
              className="absolute inset-y-[3px] left-0 right-0 rounded-full"
              style={{
                backgroundImage: `linear-gradient(to right, transparent, rgba(0,0,0,0.5)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' width='8' height='8' fill='%23fff'/%3E%3Crect y='8' width='8' height='8' fill='%23fff'/%3E%3C/svg%3E")`,
                backgroundSize: "auto, 8px 8px",
              }}
            />
            <div
              className="absolute top-0 w-3.5 h-3.5 rounded-full bg-card border border-[rgba(24,24,29,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] -translate-x-1/2 pointer-events-none"
              style={{ left: `${opacity}%` }}
            />
          </div>
        </div>
      </div>

      {/* HEX/RGB Input Row */}
      <div className="flex items-center gap-2">
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center justify-between px-3 py-1.5 h-8 w-[72px] rounded-lg border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] shrink-0 hover:bg-muted/70 transition-colors focus:outline-none">
            <span className="text-xs text-[rgba(9,9,9,0.9)]">{mode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
          </MenuButton>
          <Portal>
            <MenuItems
              anchor="bottom start"
              className="z-[100] mt-1 w-[120px] bg-card border border-border rounded-lg p-1 shadow-lg focus:outline-none"
            >
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={() => setMode("HEX")}
                    className={`flex items-center w-full px-2 py-1.5 rounded-md text-sm transition-colors ${active ? "bg-muted/70 text-foreground" : "text-muted-foreground"}`}
                  >
                    HEX
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={() => setMode("RGB")}
                    className={`flex items-center w-full px-2 py-1.5 rounded-md text-sm transition-colors ${active ? "bg-muted/70 text-foreground" : "text-muted-foreground"}`}
                  >
                    RGB
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Portal>
        </Menu>

        <div className="flex flex-1 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          {mode === "HEX" ? (
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 h-7 px-2 py-1 bg-muted/70 border border-border rounded-l-lg text-sm text-[rgba(9,9,9,0.9)] outline-none"
            />
          ) : (
            <div className="flex flex-1 gap-px bg-muted/70 border border-border rounded-l-lg overflow-hidden">
              <div className="flex flex-col items-center bg-muted/70 w-1/3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={rgbInput[0]}
                  onChange={(e) => handleRgbChange(0, e.target.value)}
                  className="w-full h-7 px-1 py-1 bg-muted/70 text-center text-sm text-[rgba(9,9,9,0.9)] outline-none"
                  maxLength={3}
                />
                <span className="text-[10px] text-muted-foreground -mt-1 pb-0.5">R</span>
              </div>
              <div className="flex flex-col items-center bg-muted/70 w-1/3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={rgbInput[1]}
                  onChange={(e) => handleRgbChange(1, e.target.value)}
                  className="w-full h-7 px-1 py-1 bg-muted/70 text-center text-sm text-[rgba(9,9,9,0.9)] outline-none"
                  maxLength={3}
                />
                <span className="text-[10px] text-muted-foreground -mt-1 pb-0.5">G</span>
              </div>
              <div className="flex flex-col items-center bg-muted/70 w-1/3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={rgbInput[2]}
                  onChange={(e) => handleRgbChange(2, e.target.value)}
                  className="w-full h-7 px-1 py-1 bg-muted/70 text-center text-sm text-[rgba(9,9,9,0.9)] outline-none"
                  maxLength={3}
                />
                <span className="text-[10px] text-muted-foreground -mt-1 pb-0.5">B</span>
              </div>
            </div>
          )}
          <div className="relative h-7 w-[52px] bg-muted/70 border border-l-0 border-border rounded-r-lg flex items-center px-2">
            <span className="text-sm text-[rgba(9,9,9,0.9)]">{opacity}</span>
            <span className="absolute right-1.5 text-xs text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Color Input Component ---
function ColorInput({
  label,
  value,
  colorSwatch,
  onColorChange,
}: {
  label: string;
  value: string;
  colorSwatch: string;
  onColorChange?: (hex: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isEditable = Boolean(onColorChange);

  return (
    <div className="flex flex-col gap-2 flex-1 relative">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div
        className={`flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg transition-colors ${isEditable ? "cursor-pointer hover:border-muted-foreground/60" : "cursor-default"}`}
        onClick={() => {
          if (!isEditable) return;
          setShowPicker(!showPicker);
        }}
      >
        <div
          className="w-5 h-5 rounded shrink-0"
          style={{ backgroundColor: colorSwatch }}
        />
        <span className="flex-1 text-sm text-foreground">{value}</span>
        <Copy
          className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer hover:text-muted-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(value);
          }}
        />
      </div>
      {showPicker && isEditable && (
        <ColorPicker
          color={colorSwatch}
          onChange={(hex) => onColorChange?.(hex)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// --- General Setting Content ---
function GeneralSettingContent({ initialData, refreshProfile }: { initialData?: ProfileData | null; refreshProfile?: () => Promise<void> }) {
  const [formData, setFormData] = useState({
    business_name: "",
    poc_email: "",
    poc_name: "",
    timezone: "",
    domain: "",
  });
  const [savedData, setSavedData] = useState(formData);
  const [isEditing, setIsEditing] = useState(false);
  const [timezoneQuery, setTimezoneQuery] = useState("");

  useEffect(() => {
    if (initialData) {
      const data = {
        business_name: initialData.business_name || "",
        poc_email: initialData.poc_email || "",
        poc_name: initialData.poc_name || "",
        timezone: initialData.timezone || "",
        domain: initialData.domain || "",
      };
      setFormData(data);
      setSavedData(data);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      const result = await updateBusinessProfile(formData);
      if (result.success) {
        setSavedData(formData);
        setIsEditing(false);
        toastQueue.add({
          title: "General Settings Saved",
          description: "Your general business settings have been updated.",
          variant: "success",
        }, { timeout: 3000 });
        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      toastQueue.add({
        title: "Save Failed",
        description: e.message || "Failed to save general settings.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setIsEditing(false);
  };

  const inputBaseClass = "h-9 px-3 text-sm text-foreground border rounded-lg outline-none transition-colors";
  const inputEditClass = `${inputBaseClass} border-border bg-card focus:border-[#3f52ff]`;
  const inputReadOnlyClass = `${inputBaseClass} border-border bg-muted`;
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

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header with Edit Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">General Settings</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Manage your business profile information
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors w-full sm:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      {/* Business Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Business Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Eventy"
              className={inputEditClass}
            />
          ) : (
            <div className={inputReadOnlyClass + " flex items-center"}>
              {formData.business_name || <span className="text-muted-foreground">Not set</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">POC Email</label>
          {isEditing ? (
            <input
              type="email"
              value={formData.poc_email}
              onChange={(e) => setFormData({ ...formData, poc_email: e.target.value })}
              placeholder="eventy@gmail.com"
              className={inputEditClass}
            />
          ) : (
            <div className={inputReadOnlyClass + " flex items-center"}>
              {formData.poc_email || <span className="text-muted-foreground">Not set</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">POC Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.poc_name}
              onChange={(e) => setFormData({ ...formData, poc_name: e.target.value })}
              placeholder="Eventygo"
              className={inputEditClass}
            />
          ) : (
            <div className={inputReadOnlyClass + " flex items-center"}>
              {formData.poc_name || <span className="text-muted-foreground">Not set</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Time Zone</label>
          {isEditing ? (
            <Menu as="div" className="relative w-full">
              {({ open }) => (
                <>
                  <MenuButton className={`${inputEditClass} w-full flex items-center justify-between`}>
                    <span className="truncate text-left">
                      {formData.timezone || "Select Time Zone"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                  </MenuButton>
                  <Portal>
                    <MenuItems
                      anchor="bottom start"
                      transition
                      className="z-[100] mt-1 max-h-[340px] w-[min(560px,calc(100vw-2rem))] overflow-auto rounded-xl border border-border bg-card p-2 shadow-lg transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                    >
                      <div className="sticky top-0 z-10 bg-card pb-2">
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
                      </div>
                      {timezoneGroups.length > 0 ? (
                        timezoneGroups.map(([continent, items]) => (
                          <div key={continent} className="py-1">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                              {continent}
                            </div>
                            <div className="flex flex-col">
                              {items.map((tz) => (
                                <MenuItem key={tz}>
                                  <button
                                    onClick={() => {
                                      setFormData({ ...formData, timezone: tz });
                                      setTimezoneQuery("");
                                    }}
                                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus:outline-none ${formData.timezone === tz
                                      ? "bg-blue-100 dark:bg-blue-950/40 text-[#3f52ff] dark:text-white"
                                      : "text-foreground data-[focus]:bg-muted hover:bg-muted"
                                      }`}
                                  >
                                    {tz}
                                  </button>
                                </MenuItem>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-sm text-muted-foreground">No matching time zones</div>
                      )}
                    </MenuItems>
                  </Portal>
                </>
              )}
            </Menu>
          ) : (
            <div className={inputReadOnlyClass + " flex items-center"}>
              {formData.timezone || <span className="text-muted-foreground">Not set</span>}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full" />

      {/* Domains Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Domains</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Add and verify custom domains for your platform
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Domain</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="www.eventy.com"
              className={inputEditClass + " w-full sm:max-w-md"}
            />
          ) : (
            <div className={inputReadOnlyClass + " flex items-center w-full sm:max-w-md"}>
              {formData.domain || <span className="text-muted-foreground">Not set</span>}
            </div>
          )}
        </div>
      </div>

      {/* Save/Cancel Buttons - only shown when editing */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            onClick={handleCancel}
            className="h-8 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors w-full sm:w-auto"
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}


// --- Image Upload Component ---
function ImageUploadArea({
  label,
  value,
  onUpload,
  disabled = false,
  square = false,
  small = false,
}: {
  label: string;
  value?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
  square?: boolean;
  small?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "error", // Note: Ensure 'variant' matches the toast API
      }, { timeout: 3000 });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastQueue.add({
        title: "File Too Large",
        description: "Image size must be less than 10MB.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadBrandAsset(formData);

      onUpload(result.url);

      toastQueue.add({
        title: "Upload Successful",
        description: "Image uploaded successfully.",
        variant: "success",
      }, { timeout: 3000 });

    } catch (error: any) {
      console.error("Upload failed:", error);
      toastQueue.add({
        title: "Upload Failed",
        description: error.message || "Failed to upload image.",
        variant: "error",
      }, { timeout: 4000 });
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  const handleClick = () => {
    if (disabled) return;
    // Reset the input before clicking to ensure change event fires even for same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleClick}
        aria-disabled={disabled}
        className={`border border-dashed rounded-[14px] ${small ? "w-16 h-16 min-h-0 p-2" : square ? "aspect-square min-h-0 px-4 py-5" : "min-h-[160px] px-4 py-5"} flex flex-col items-center justify-center relative overflow-hidden transition-colors ${disabled ? "bg-muted border-border cursor-not-allowed pointer-events-none" :
          isDragging
            ? "bg-blue-50 border-[#3f52ff] dark:bg-blue-950/40 dark:border-[#8faeff] cursor-copy"
            : "bg-card border-border cursor-pointer hover:border-muted-foreground/60"
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            {/* Simple spinner */}
            <div className="w-8 h-8 border-4 border-[#3f52ff]/30 border-t-[#3f52ff] rounded-full animate-spin" />
            <span className="text-sm font-medium text-foreground">Uploading...</span>
          </div>
        ) : value ? (
          <div className="relative w-full h-full min-h-[120px] group">
            <img
              src={value}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover rounded-md"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
            )}
          </div>
        ) : (
          <>
            <div className="mb-2">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="34" height="34" rx="17" fill="#3F52FF" />
                <rect x="1" y="1" width="34" height="34" rx="17" stroke="white" strokeWidth="2" />
                <path fillRule="evenodd" clipRule="evenodd" d="M18 10.25H17.958C16.589 10.25 15.504 10.25 14.638 10.338C13.75 10.428 13.009 10.618 12.361 11.051C11.8434 11.3985 11.3985 11.8434 11.051 12.361C10.617 13.009 10.428 13.751 10.338 14.638C10.25 15.504 10.25 16.589 10.25 17.958V18.042C10.25 19.411 10.25 20.496 10.338 21.362C10.428 22.25 10.618 22.991 11.051 23.639C11.397 24.158 11.842 24.603 12.361 24.949C13.009 25.383 13.751 25.572 14.638 25.662C15.504 25.75 16.589 25.75 17.958 25.75H18.042C19.411 25.75 20.496 25.75 21.362 25.662C22.25 25.572 22.991 25.382 23.639 24.95C24.1567 24.6023 24.6016 24.157 24.949 23.639C25.383 22.991 25.572 22.249 25.662 21.362C25.75 20.496 25.75 19.411 25.75 18.042V17.958C25.75 16.589 25.75 15.504 25.662 14.638C25.572 13.75 25.382 13.009 24.95 12.361C24.6023 11.8433 24.157 11.3984 23.639 11.051C22.991 10.617 22.249 10.428 21.362 10.338C20.496 10.25 19.411 10.25 18.042 10.25H18ZM20.32 18.785C20.476 18.575 21.055 17.917 21.806 18.385C22.284 18.68 22.686 19.079 23.116 19.505C23.28 19.669 23.396 19.855 23.475 20.054C23.709 20.654 23.587 21.377 23.337 21.972C23.1956 22.3182 22.9808 22.6297 22.7076 22.885C22.4343 23.1403 22.109 23.3334 21.754 23.451C21.4358 23.5517 21.1038 23.602 20.77 23.6H14.87C14.283 23.6 13.764 23.46 13.338 23.197C13.071 23.032 13.024 22.652 13.222 22.406C13.5513 21.9947 13.88 21.5807 14.208 21.164C14.836 20.367 15.259 20.135 15.73 20.338C15.92 20.422 16.112 20.548 16.309 20.681C16.834 21.038 17.564 21.528 18.525 20.996C19.183 20.627 19.565 19.996 19.897 19.445L19.903 19.435L19.973 19.32C20.0805 19.1365 20.1963 18.958 20.32 18.785ZM13.8 15.55C13.8 14.585 14.584 13.8 15.55 13.8C16.0141 13.8 16.4592 13.9844 16.7874 14.3126C17.1156 14.6408 17.3 15.0859 17.3 15.55C17.3 16.0141 17.1156 16.4592 16.7874 16.7874C16.4592 17.1156 16.0141 17.3 15.55 17.3C14.584 17.3 13.8 16.515 13.8 15.55Z" fill="white" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDragging ? "text-[#3f52ff] dark:text-white dark:text-[#8faeff]" : "text-foreground"}`}>
              {isDragging ? "Drop to upload" : "Upload image"}
            </span>
            <span className="text-xs text-muted-foreground/70 mt-1">All files · Up to 10MB</span>
          </>
        )}
      </div>
    </div>
  );
}

// --- Chapter Cover Upload Component ---
function ChapterCoverUpload({ value, onUpload }: { value?: string; onUpload: (url: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastQueue.add({
        title: "File Too Large",
        description: "Image size must be less than 10MB.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    // Use local preview URL (no server upload)
    const previewUrl = URL.createObjectURL(file);
    onUpload(previewUrl);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`border border-dashed rounded-[14px] aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-colors ${isDragging
        ? "bg-blue-50 border-[#3f52ff] dark:bg-blue-950/40 dark:border-[#8faeff] cursor-copy"
        : "bg-card border-border cursor-pointer hover:border-muted-foreground/60"
        }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#3f52ff]/30 border-t-[#3f52ff] rounded-full animate-spin" />
          <span className="text-sm font-medium text-foreground">Uploading...</span>
        </div>
      ) : value ? (
        <div className="relative w-full h-full min-h-[120px] group">
          <img
            src={value}
            alt="Chapter Cover"
            className="absolute inset-0 h-full w-full object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpload("");
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-2">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.44444" y="1.44444" width="49.1111" height="49.1111" rx="24.5556" fill="#3F52FF" />
              <rect x="1.44444" y="1.44444" width="49.1111" height="49.1111" rx="24.5556" stroke="white" strokeWidth="2.88889" />
              <path fillRule="evenodd" clipRule="evenodd" d="M26 14.8055H25.9393C23.9619 14.8055 22.3947 14.8055 21.1438 14.9327C19.8611 15.0627 18.7908 15.3371 17.8548 15.9625C17.1071 16.4644 16.4644 17.1071 15.9625 17.8548C15.3357 18.7908 15.0627 19.8625 14.9327 21.1438C14.8055 22.3947 14.8055 23.9619 14.8055 25.9393V26.0607C14.8055 28.0381 14.8055 29.6053 14.9327 30.8562C15.0627 32.1389 15.3371 33.2092 15.9625 34.1452C16.4623 34.8949 17.1051 35.5377 17.8548 36.0374C18.7908 36.6643 19.8625 36.9373 21.1438 37.0673C22.3947 37.1944 23.9619 37.1944 25.9393 37.1944H26.0607C28.0381 37.1944 29.6053 37.1944 30.8562 37.0673C32.1389 36.9373 33.2092 36.6629 34.1452 36.0389C34.893 35.5366 35.5357 34.8934 36.0374 34.1452C36.6643 33.2092 36.9373 32.1374 37.0673 30.8562C37.1944 29.6053 37.1944 28.0381 37.0673 21.1438C36.9373 19.8611 36.6629 18.7908 36.0389 17.8548C35.5366 17.107 34.8934 16.4643 34.1452 15.9625C33.2092 15.3357 32.1374 15.0627 30.8562 14.9327C29.6053 14.8055 28.0381 14.8055 26.0607 14.8055H26ZM29.3511 27.1339C29.5764 26.8305 30.4128 25.8801 31.4975 26.5561C32.188 26.9822 32.7687 27.5585 33.3898 28.1739C33.6267 28.4108 33.7942 28.6794 33.9083 28.9669C34.2463 29.8335 34.0701 30.8779 33.709 31.7373C33.5047 32.2374 33.1945 32.6873 32.7998 33.056C32.4051 33.4248 31.9352 33.7038 31.4224 33.8737C30.9628 34.0191 30.4832 34.0917 30.0011 34.0889H21.4789C20.631 34.0889 19.8813 33.8867 19.266 33.5068C18.8803 33.2684 18.8124 32.7195 19.0984 32.3642C19.5741 31.7701 20.0489 31.1721 20.5227 30.5702C21.4298 29.419 22.0408 29.0839 22.7211 29.3771C22.9955 29.4984 23.2729 29.6804 23.5574 29.8725C24.3158 30.3882 25.3702 31.096 26.7583 30.3275C27.7088 29.7945 28.2605 28.8831 28.7401 28.0872L28.7488 28.0728L28.8499 27.9067C29.0051 27.6416 29.1724 27.3837 29.3511 27.1339ZM19.9333 22.4611C19.9333 21.0672 21.0658 19.9333 22.4611 19.9333C23.1315 19.9333 23.7745 20.1996 24.2485 20.6737C24.7226 21.1477 24.9889 21.7907 24.9889 22.4611C24.9889 23.1315 24.7226 23.7745 24.2485 24.2485C23.7745 24.7226 23.1315 24.9889 22.4611 24.9889C21.0658 24.9889 19.9333 23.855 19.9333 22.4611Z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-medium text-foreground">
            {isDragging ? "Drop to upload" : "Upload chapter cover"}
          </span>
          <span className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, GIF, WebP · Up to 10MB</span>
        </div>
      )}
    </div>
  );
}

// --- Branding Content ---
function BrandingContent({ initialData, refreshProfile }: { initialData?: any; refreshProfile?: () => Promise<void> }) {
  const [colors, setColors] = useState({
    primary: "#1F4E79",
    invert: "#00875A",
    secondary: "#2563EB",
    text: "#22292F",
    headerBg: "#1F4E79",
    chatBg: "#2563EB",
    headerIcon: "#00875A",
    chatSend: "#22292F",
    // These will be pulled from `initialData` object directly if they exist at root of profile, 
    // but here we are receiving `profile?.colors` as initialData prop in the parent... 
    // Wait, the parent passed `initialData={profile?.colors}`.
    // If we want to support images, we might need to change how data is passed or assume images are inside the `colors` JSON for now 
    // OR ideally update the parent to pass the full profile.
  });

  // Persisted image fields in business_profiles
  const [images, setImages] = useState({
    splash_screen_logo: "",
    get_started_logo: "",
    home_screen_logo: "",
    favicon: "",
    get_started_background: "",
    forgot_password_background: "",
  });

  const [savedColors, setSavedColors] = useState(colors);
  const [savedImages, setSavedImages] = useState(images);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { colors: colorsData, web_login_image, home_background_image } = initialData;

      // Parse colors if it's a JSON string, otherwise use as object
      let parsedColors: any = {};
      if (colorsData) {
        parsedColors = typeof colorsData === 'string' ? JSON.parse(colorsData) : colorsData;
        setColors((prev) => ({ ...prev, ...parsedColors }));
        setSavedColors((prev) => ({ ...prev, ...parsedColors }));
      }

      setImages({
        splash_screen_logo: web_login_image || parsedColors?.splash_screen_logo || "",
        get_started_logo: parsedColors?.get_started_logo || "",
        home_screen_logo: home_background_image || parsedColors?.home_screen_logo || "",
        favicon: parsedColors?.favicon || "",
        get_started_background: parsedColors?.get_started_background || "",
        forgot_password_background: parsedColors?.forgot_password_background || "",
      });
      setSavedImages({
        splash_screen_logo: web_login_image || parsedColors?.splash_screen_logo || "",
        get_started_logo: parsedColors?.get_started_logo || "",
        home_screen_logo: home_background_image || parsedColors?.home_screen_logo || "",
        favicon: parsedColors?.favicon || "",
        get_started_background: parsedColors?.get_started_background || "",
        forgot_password_background: parsedColors?.forgot_password_background || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSave = async () => {
    try {
      const result = await updateBusinessProfile({
        colors: JSON.stringify({
          ...colors,
          splash_screen_logo: images.splash_screen_logo || "",
          get_started_logo: images.get_started_logo || "",
          home_screen_logo: images.home_screen_logo || "",
          favicon: images.favicon || "",
          get_started_background: images.get_started_background || "",
          forgot_password_background: images.forgot_password_background || "",
        }),
        web_login_image: images.splash_screen_logo || null,
        home_background_image: images.home_screen_logo || null
      });

      if (result.success) {
        setSavedColors(colors);
        setSavedImages(images);
        setIsEditing(false);
        toastQueue.add({
          title: "Branding Saved",
          description: "Your branding settings have been saved successfully.",
          variant: "success",
        }, { timeout: 3000 });
        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      console.error(e);
      toastQueue.add({
        title: "Save Failed",
        description: e.message || "Failed to save branding settings.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const handleCancel = () => {
    setColors(savedColors);
    setImages(savedImages);
    setIsEditing(false);
  };

  const updateColor = (key: keyof typeof colors) => (hex: string) => {
    setColors((prev) => ({ ...prev, [key]: hex }));
  };

  const updateImage = (key: keyof typeof images) => (url: string) => {
    if (!isEditing) return;
    setImages((prev) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header with Edit Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Branding</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Customize your app&apos;s visual appearance
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors w-full sm:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      {/* Logo Uploads */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ImageUploadArea
          label="Splash Screen Logo"
          value={images.splash_screen_logo}
          onUpload={updateImage("splash_screen_logo")}
          disabled={!isEditing}
          square
          small
        />
        <ImageUploadArea
          label="Get Started Logo"
          value={images.get_started_logo}
          onUpload={updateImage("get_started_logo")}
          disabled={!isEditing}
          square
          small
        />
        <ImageUploadArea
          label="Home Screen Logo"
          value={images.home_screen_logo}
          onUpload={updateImage("home_screen_logo")}
          disabled={!isEditing}
          square
          small
        />
        <ImageUploadArea
          label="Favicon"
          value={images.favicon}
          onUpload={updateImage("favicon")}
          disabled={!isEditing}
          square
          small
        />
        <ImageUploadArea
          label="Get Started Background"
          value={images.get_started_background}
          onUpload={updateImage("get_started_background")}
          disabled={!isEditing}
        />
        <ImageUploadArea
          label="Forget Password Background"
          value={images.forgot_password_background}
          onUpload={updateImage("forgot_password_background")}
          disabled={!isEditing}
        />
      </div>

      {/* Color Row 1: Primary Color + Invert Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorInput label="Primary Color" value={colors.primary} colorSwatch={colors.primary} onColorChange={isEditing ? updateColor("primary") : undefined} />
        <ColorInput label="Invert Colors" value={colors.invert} colorSwatch={colors.invert} onColorChange={isEditing ? updateColor("invert") : undefined} />
      </div>

      {/* Navigation/Icons hint */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
          <span className="text-[10px]">i</span>
        </div>
        Navigations/Icons
      </div>

      {/* Color Row 2: Secondary Color + Text Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorInput label="Secondary Color" value={colors.secondary} colorSwatch={colors.secondary} onColorChange={isEditing ? updateColor("secondary") : undefined} />
        <ColorInput label="Text Color" value={colors.text} colorSwatch={colors.text} onColorChange={isEditing ? updateColor("text") : undefined} />
      </div>

      {/* Color Row 3: Header BG + Chat BG + Header Icon + Chat Send Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ColorInput label="Header Background Colors" value={colors.headerBg} colorSwatch={colors.headerBg} onColorChange={isEditing ? updateColor("headerBg") : undefined} />
        <ColorInput label="Chat Background Screen Color" value={colors.chatBg} colorSwatch={colors.chatBg} onColorChange={isEditing ? updateColor("chatBg") : undefined} />
        <ColorInput label="Header Icon Color" value={colors.headerIcon} colorSwatch={colors.headerIcon} onColorChange={isEditing ? updateColor("headerIcon") : undefined} />
        <ColorInput label="Chat Send Button Color" value={colors.chatSend} colorSwatch={colors.chatSend} onColorChange={isEditing ? updateColor("chatSend") : undefined} />
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full" />

      {/* Save/Cancel Buttons - only shown when editing */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            onClick={handleCancel}
            className="h-8 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors w-full sm:w-auto"
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// --- Radio Option Component ---
function RadioOption({
  label,
  selected,
  onClick, // Changed from onSelect to onClick for consistency with button
}: {
  label: string;
  selected: boolean;
  onClick: () => void; // Changed from onSelect to onClick
}) {
  return (
    <button
      onClick={onClick} // Changed from onSelect to onClick
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] ${selected
          ? "bg-[#173254] border-[#173254] dark:bg-[#8faeff] dark:border-[#8faeff]"
          : "bg-card border-border"
          }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-card" />}
      </div>
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// --- Module Item Component ---
function ModuleItem({
  icon, // New prop
  label, // New prop
  description,
  action, // New prop, replaces enabled, onToggle, radioOptions, selectedRadio, onRadioSelect
}: {
  icon: React.ReactNode; // New prop
  label: string; // New prop
  description: string;
  action: React.ReactNode; // New prop
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3"> {/* Added flex container for icon and text */}
        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            {description}
          </span>
        </div>
      </div>
      {action}
    </div>
  );
}

// --- Social Link Input with Platform Icon ---
function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.47 6.77 15.3 0h-1.38L8.85 5.88 4.81 0H.15l6.11 8.9L.15 16h1.38l5.35-6.21L11.19 16h4.66L9.47 6.77Zm-1.9 2.2-.62-.89L2.13 1.04h2.13l3.98 5.69.62.89 5.17 7.4h-2.13L7.57 8.97Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.51 0h-2.2v10.96c0 1.31-1.07 2.38-2.39 2.38A2.39 2.39 0 0 1 4.54 11a2.39 2.39 0 0 1 2.38-2.38c.25 0 .49.04.71.11V6.48a4.59 4.59 0 0 0-.71-.06A4.58 4.58 0 0 0 2.34 11a4.58 4.58 0 0 0 4.58 4.58A4.58 4.58 0 0 0 11.5 11V5.16a5.8 5.8 0 0 0 3.38 1.08V4.04a3.38 3.38 0 0 1-3.38-3.38V0Z" />
    </svg>
  );
}

function SocialLinkInput({
  label,
  icon,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className={`flex items-center gap-2 h-9 px-3 border rounded-lg transition-colors ${readOnly
        ? "bg-muted border-border"
        : "bg-card border-border focus-within:border-[#3f52ff]"
        }`}>
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        {readOnly ? (
          <span className="flex-1 text-sm text-foreground truncate">
            {value || <span className="text-muted-foreground">Not set</span>}
          </span>
        ) : (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL"
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
          />
        )}
      </div>
    </div>
  );
}

// --- Social Links Content ---
function SocialLinksContent({ initialData, refreshProfile }: { initialData?: any; refreshProfile?: () => Promise<void> }) {
  const [links, setLinks] = useState({
    linkedin: "",
    xTwitter: "",
    instagram: "",
    tiktok: "",
  });
  const [savedLinks, setSavedLinks] = useState(links);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLinks((prev) => ({ ...prev, ...initialData }));
      setSavedLinks((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ social_links: links });
      setSavedLinks(links);
      setIsEditing(false);
      toastQueue.add({
        title: "Social Links Saved",
        description: "Your social media links have been updated.",
        variant: "success",
      }, { timeout: 3000 });
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save social links.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const handleCancel = () => {
    setLinks(savedLinks);
    setIsEditing(false);
  };

  const updateLink = (key: keyof typeof links) => (val: string) => {
    setLinks((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-[#ECEFF2] border border-[#D5DDE2] dark:bg-muted dark:border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
            Social Links
          </h1>
          <p className="text-base font-semibold text-muted-foreground leading-[18px]">
            Manage your social media links and online presence
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* White Card */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
        {/* Row 1: LinkedIn + X / Twitter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SocialLinkInput
            label="LinkedIn"
            icon={<Linkedin className="w-4 h-4" />}
            value={links.linkedin}
            onChange={updateLink("linkedin")}
            readOnly={!isEditing}
          />
          <SocialLinkInput
            label="X / Twitter"
            icon={<XTwitterIcon className="w-4 h-4" />}
            value={links.xTwitter}
            onChange={updateLink("xTwitter")}
            readOnly={!isEditing}
          />
        </div>

        {/* Row 2: Instagram + TikTok */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SocialLinkInput
            label="Instagram"
            icon={<Instagram className="w-4 h-4" />}
            value={links.instagram}
            onChange={updateLink("instagram")}
            readOnly={!isEditing}
          />
          <SocialLinkInput
            label="TikTok"
            icon={<TikTokIcon className="w-4 h-4" />}
            value={links.tiktok}
            onChange={updateLink("tiktok")}
            readOnly={!isEditing}
          />
        </div>

        {/* Save/Cancel Buttons - only shown when editing */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              onClick={handleCancel}
              className="h-8 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors w-full sm:w-auto"
            >
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Legal and T&C Content ---
function LegalAndTCContent({ initialData, refreshProfile }: { initialData?: any; refreshProfile?: () => Promise<void> }) {
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [savedTermsUrl, setSavedTermsUrl] = useState("");
  const [savedPrivacyUrl, setSavedPrivacyUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.terms_url) {
        setTermsUrl(initialData.terms_url);
        setSavedTermsUrl(initialData.terms_url);
      }
      if (initialData.privacy_url) {
        setPrivacyUrl(initialData.privacy_url);
        setSavedPrivacyUrl(initialData.privacy_url);
      }
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ terms_url: termsUrl, privacy_url: privacyUrl });
      setSavedTermsUrl(termsUrl);
      setSavedPrivacyUrl(privacyUrl);
      setIsEditing(false);
      toastQueue.add({
        title: "Legal Documents Saved",
        description: "Your legal URLs have been updated.",
        variant: "success",
      }, { timeout: 3000 });
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save legal documents.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const handleCancel = () => {
    setTermsUrl(savedTermsUrl);
    setPrivacyUrl(savedPrivacyUrl);
    setIsEditing(false);
  };

  const inputBaseClass = "flex items-center gap-2 h-10 px-3 border rounded-lg transition-colors";
  const inputEditClass = `${inputBaseClass} bg-card border-border focus-within:border-[#3f52ff]`;
  const inputReadOnlyClass = `${inputBaseClass} bg-muted border-border`;

  return (
    <div className="bg-[#ECEFF2] border border-[#D5DDE2] dark:bg-muted dark:border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
            Legal &amp; T&amp;C
          </h1>
          <p className="text-base font-semibold text-muted-foreground leading-[18px]">
            Manage your Legal &amp; T&amp;C documents and compliance settings
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* White Card */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
        {/* Terms & Conditions URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Terms &amp; Conditions URL
          </label>
          <div className={isEditing ? inputEditClass : inputReadOnlyClass}>
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            {isEditing ? (
              <input
                type="url"
                value={termsUrl}
                onChange={(e) => setTermsUrl(e.target.value)}
                placeholder="Paste URL"
                className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
              />
            ) : (
              <span className="flex-1 text-sm text-foreground truncate">
                {termsUrl || <span className="text-muted-foreground">Not set</span>}
              </span>
            )}
          </div>
        </div>

        {/* Privacy Policy URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Privacy Policy URL
          </label>
          <div className={isEditing ? inputEditClass : inputReadOnlyClass}>
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            {isEditing ? (
              <input
                type="url"
                value={privacyUrl}
                onChange={(e) => setPrivacyUrl(e.target.value)}
                placeholder="Paste URL"
                className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
              />
            ) : (
              <span className="flex-1 text-sm text-foreground truncate">
                {privacyUrl || <span className="text-muted-foreground">Not set</span>}
              </span>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons - only shown when editing */}
        {isEditing && (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="h-8 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
            >
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Modules Content ---
function ModulesContent({ initialData, refreshProfile }: { initialData?: any; refreshProfile?: () => Promise<void> }) {
  const [modules, setModules] = useState({
    events: false,
    tickets: false,
    calendarView: false,
    chat: false,
    exploreMembers: true,
    exploreCompany: true,
    exploreMembersScope: "all",
    exploreCompanyScope: "all",
  });
  const [savedModules, setSavedModules] = useState(modules);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setModules((prev) => ({ ...prev, ...initialData }));
      setSavedModules((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ modules });
      setSavedModules(modules);
      setIsEditing(false);
      toastQueue.add({
        title: "Modules Saved",
        description: "Your module settings have been updated.",
        variant: "success",
      }, { timeout: 3000 });
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save modules settings.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const handleCancel = () => {
    setModules(savedModules);
    setIsEditing(false);
  };

  const updateModule = (key: keyof typeof modules) => (checked: boolean) => {
    setModules((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">Modules</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Enable or disable features for your
            <br />
            platform
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <ModuleItem
          icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
          label="Events"
          description="Create and manage events"
          action={<AriaSwitch isSelected={modules.events} onChange={isEditing ? updateModule("events") : undefined} isDisabled={!isEditing} />}
        />
        <ModuleItem
          icon={<Ticket className="w-4 h-4 text-muted-foreground" />}
          label="Tickets"
          description="Sell tickets for events"
          action={<AriaSwitch isSelected={modules.tickets} onChange={isEditing ? updateModule("tickets") : undefined} isDisabled={!isEditing} />}
        />
        <ModuleItem
          icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
          label="Calendar View"
          description="Display events in a calendar view"
          action={<AriaSwitch isSelected={modules.calendarView} onChange={isEditing ? updateModule("calendarView") : undefined} isDisabled={!isEditing} />}
        />
        <ModuleItem
          icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
          label="Chat"
          description="Enable chat for events"
          action={<AriaSwitch isSelected={modules.chat} onChange={isEditing ? updateModule("chat") : undefined} isDisabled={!isEditing} />}
        />
        <ModuleItem
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
          label="Explore Members"
          description="Allow members to explore other members"
          action={
            <div className="flex items-start gap-2 lg:gap-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <RadioOption
                  selected={modules.exploreMembersScope === "all"}
                  onClick={() => isEditing && setModules((prev) => ({ ...prev, exploreMembersScope: "all" }))}
                  label="All"
                />
                <RadioOption
                  selected={modules.exploreMembersScope === "city"}
                  onClick={() => isEditing && setModules((prev) => ({ ...prev, exploreMembersScope: "city" }))}
                  label="City Only"
                />
              </div>
              <div className="h-6 w-px bg-muted mx-2" />
              <AriaSwitch isSelected={modules.exploreMembers} onChange={isEditing ? updateModule("exploreMembers") : undefined} isDisabled={!isEditing} />
            </div>
          }
        />
        <ModuleItem
          icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
          label="Explore Company"
          description="Allow members to explore companies"
          action={
            <div className="flex items-start gap-2 lg:gap-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <RadioOption
                  selected={modules.exploreCompanyScope === "all"}
                  onClick={() => isEditing && setModules((prev) => ({ ...prev, exploreCompanyScope: "all" }))}
                  label="All"
                />
                <RadioOption
                  selected={modules.exploreCompanyScope === "city"}
                  onClick={() => isEditing && setModules((prev) => ({ ...prev, exploreCompanyScope: "city" }))}
                  label="City Only"
                />
              </div>
              <div className="h-6 w-px bg-muted mx-2" />
              <AriaSwitch isSelected={modules.exploreCompany} onChange={isEditing ? updateModule("exploreCompany") : undefined} isDisabled={!isEditing} />
            </div>
          }
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full mt-2" />

      {/* Save/Cancel Buttons - only shown when editing */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="h-8 px-4 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// --- Stat Card Component ---
function StatCard({
  icon,
  title,
  subtitle,
  value,
  mobileTitle,
  mobileTopValue,
  isFirst,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string | number;
  mobileTitle?: React.ReactNode;
  mobileTopValue?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex-1 bg-card border border-border p-4 -mr-px ${mobileTopValue ? "relative" : ""} ${isFirst ? "rounded-l-lg sm:rounded-l-lg" : ""
        } ${isLast ? "rounded-r-lg sm:rounded-r-lg" : ""}`}
    >
      {mobileTopValue && (
        <span className="text-base font-semibold text-foreground leading-[18px] absolute top-3 right-3 sm:hidden">
          {value}
        </span>
      )}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-muted border border-border rounded-[5.4px] p-[7px] flex items-center justify-center">
            {icon}
          </div>
          {mobileTitle ? (
            <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
              {mobileTitle}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
              {title}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground leading-[18px]">
          {subtitle}
        </span>
        <div className="flex items-center justify-between">
          <span
            className={`text-base font-semibold text-foreground leading-[18px] ${mobileTopValue ? "hidden" : ""}`}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-muted border border-border rounded-[5.4px] p-[7px] flex items-center justify-center">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
              {title}
            </span>
            <span className="text-xs text-muted-foreground leading-[18px]">
              {subtitle}
            </span>
          </div>
        </div>
        <span className="text-base font-semibold text-foreground leading-[18px]">
          {value}
        </span>
      </div>
    </div>
  );
}

// --- Team Tab Content ---
type TeamRole = "Member" | "Co-Lead" | "Chapter Lead";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl?: string;
}

function TeamTabContent({
  members,
  setMembers,
}: {
  members: TeamMember[];
  setMembers: Dispatch<SetStateAction<TeamMember[]>>;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("Member");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [memberAvatarUrl, setMemberAvatarUrl] = useState("");
  const memberAvatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const addMember = () => {
    if (!fullName.trim() || !email.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        avatarUrl: memberAvatarUrl || "",
      },
    ]);
    setFullName("");
    setEmail("");
    setSelectedRole("Member");
    setMemberAvatarUrl("");
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMemberRole = (id: string, role: TeamRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  const roleBadgeColor: Record<TeamRole, string> = {
    Member: "bg-[#3f52ff] text-white",
    "Co-Lead": "bg-[#3f52ff] text-white",
    "Chapter Lead": "bg-[#3f52ff] text-white",
  };

  const handleMemberAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadBrandAsset(formData);
      setMemberAvatarUrl(result.url);
      toastQueue.add({
        title: "Avatar Uploaded",
        description: "Team member avatar uploaded successfully.",
        variant: "success",
      }, { timeout: 2500 });
    } catch (error) {
      console.error(error);
      toastQueue.add({
        title: "Upload Failed",
        description: "Could not upload avatar. Please try again.",
        variant: "error",
      }, { timeout: 3000 });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold text-foreground leading-[18px]">
          Chapter Team Members
        </span>
        <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
          Add team members who will manage this chapter and receive admin
          notifications
        </span>
      </div>

      {/* Team Member Headshot */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">
          Team Member Headshot
        </span>
        <button
          type="button"
          onClick={() => memberAvatarInputRef.current?.click()}
          className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground/60 transition-colors overflow-hidden bg-card"
        >
          {memberAvatarUrl ? (
            <img src={memberAvatarUrl} alt="Member avatar" className="w-full h-full object-cover" />
          ) : isUploadingAvatar ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground opacity-60" />
          )}
        </button>
        <input
          ref={memberAvatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMemberAvatarUpload}
        />
      </div>
      <div className="flex">
        <span className="text-xs text-muted-foreground">Upload an avatar for the member you are adding</span>
      </div>

      {/* Add Member Row */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex items-end gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-2 flex-1 md:flex-none">
            <label className="text-sm font-semibold text-foreground">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className="h-9 w-full md:w-[180px] px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="h-9 px-3 flex items-center gap-2 text-sm text-foreground border border-border rounded-lg hover:border-muted-foreground/60 transition-colors bg-card"
            >
              {selectedRole}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showRoleDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
                {(["Chapter Lead", "Co-Lead", "Member"] as TeamRole[]).map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/70 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedRole === role
                        ? "text-[#3f52ff] dark:text-white font-medium"
                        : "text-foreground"
                        }`}
                    >
                      {role}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-sm font-semibold text-foreground">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="h-9 w-full md:w-[200px] px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
          />
        </div>
        <button
          onClick={addMember}
          className="h-9 px-4 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors whitespace-nowrap w-full md:w-auto"
        >
          + Add team member
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full" />

      {/* Team Members List */}
      <div className="flex flex-col gap-2">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-card border border-border rounded-xl border-dashed">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No team members yet</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Add team members above to help manage this chapter.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onRemove={() => removeMember(member.id)}
              onRoleChange={(role) => updateMemberRole(member.id, role)}
              badgeClass={roleBadgeColor[member.role]}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- Team Member Card ---
function TeamMemberCard({
  member,
  onRemove,
  onRoleChange,
  badgeClass,
}: {
  member: TeamMember;
  onRemove: () => void;
  onRoleChange: (role: TeamRole) => void;
  badgeClass: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-2 flex items-center justify-between gap-2 max-w-[564px]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={`hidden md:flex rounded-[9px] items-center justify-center w-10 h-10 overflow-hidden shrink-0 ${member.avatarUrl ? "p-0 bg-transparent" : "p-3 bg-blue-100 dark:bg-blue-950/40"}`}>
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <CircleUserRound className="w-4 h-4 text-[#3f52ff] dark:text-white dark:text-[#8faeff]" />
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-base font-semibold text-foreground leading-[18px]">
              {member.name}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeClass}`}
            >
              {member.role}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground leading-[18px] truncate">
            {member.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 px-3 flex items-center gap-1.5 text-sm text-foreground bg-muted/70 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {member.role}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
              {(["Chapter Lead", "Co-Lead", "Member"] as TeamRole[]).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/70 transition-colors first:rounded-t-lg last:rounded-b-lg ${member.role === role
                      ? "text-[#3f52ff] dark:text-white font-medium"
                      : "text-foreground"
                      }`}
                  >
                    {role}
                  </button>
                )
              )}
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// --- Create Chapter Form ---
const createChapterTabs = ["Basic Info", "Venue", "Team", "Setting"] as const;
type CreateChapterTab = (typeof createChapterTabs)[number];

interface EditChapterData {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  cover_image?: string;
  venue_name?: string;
  full_address?: string;
  sort_order?: number;
  notifications?: any;
  team_members?: TeamMember[];
}

function CreateChapterForm({ onDismiss, onChapterSaved, editData }: { onDismiss: () => void; onChapterSaved?: () => void; editData?: EditChapterData | null }) {
  const [activeTab, setActiveTab] = useState<CreateChapterTab>("Basic Info");
  const [venueName, setVenueName] = useState(editData?.venue_name || "");
  const [fullAddress, setFullAddress] = useState(editData?.full_address || "");
  const [searchPlace, setSearchPlace] = useState("");
  const [placePredictions, setPlacePredictions] = useState<{ description: string; place_id: string }[]>([]);
  const [isPlacesOpen, setIsPlacesOpen] = useState(false);
  const placesBoxRef = useRef<HTMLDivElement | null>(null);
  const [venueLatLng, setVenueLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [chapterName, setChapterName] = useState(editData?.name || "");
  const [chapterCode, setChapterCode] = useState(editData?.code || "");
  const [city, setCity] = useState(editData?.city || "");
  const [country, setCountry] = useState(editData?.country || "");
  const [coverImage, setCoverImage] = useState<string>(editData?.cover_image || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sortOrder, setSortOrder] = useState<number | "">(editData?.sort_order ?? "");
  const [notifications, setNotifications] = useState<{
    enableNotifications: boolean;
    autoNotifyNewEvents: boolean;
    autoNotifyNewUpdates: boolean;
    autoNotifyAnnouncements: boolean;
  }>(editData?.notifications || {
    enableNotifications: false,
    autoNotifyNewEvents: true,
    autoNotifyNewUpdates: false,
    autoNotifyAnnouncements: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    editData?.team_members || []
  );
  useEffect(() => {
    setTeamMembers(editData?.team_members || []);
  }, [editData?.id, editData?.team_members]);

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
    const q = searchPlace.trim();
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
  }, [searchPlace]);

  const selectPlace = async (placeId: string, description: string) => {
    setSearchPlace(description);
    setIsPlacesOpen(false);

    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`);
      const data = await res.json();
      const result = data?.result;
      const formatted = result?.formatted_address;
      const lat = result?.geometry?.location?.lat;
      const lng = result?.geometry?.location?.lng;

      if (typeof formatted === "string" && formatted.trim()) {
        setFullAddress(formatted);
      }
      if (typeof lat === "number" && typeof lng === "number") {
        setVenueLatLng({ lat, lng });
      }
    } catch {
      // Non-fatal; keep selection
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const res = await fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      const first = Array.isArray(data?.results) ? data.results[0] : null;
      const formatted = first?.formatted_address;
      const lat = first?.geometry?.location?.lat;
      const lng = first?.geometry?.location?.lng;

      if (typeof formatted === "string" && formatted.trim()) {
        setFullAddress(formatted);
      }
      if (typeof lat === "number" && typeof lng === "number") {
        setVenueLatLng({ lat, lng });
      }
      return typeof lat === "number" && typeof lng === "number";
    } catch {
      return false;
    }
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const processCoverFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toastQueue.add({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, GIF, WebP).",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toastQueue.add({
        title: "File Too Large",
        description: "Image size must be less than 10MB.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    // Show local preview immediately, then upload to Supabase
    const previewUrl = URL.createObjectURL(file);
    setCoverImage(previewUrl);
    setIsDraggingCover(false);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadChapterCover(formData);
      setCoverImage(result.url);
    } catch (err) {
      console.error("Cover upload failed:", err);
      setCoverImage("");
      toastQueue.add({
        title: "Upload Failed",
        description: "Failed to upload cover image. Please try again.",
        variant: "error",
      }, { timeout: 3000 });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingImage(false);
    }
  };

  const handleCoverDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCoverFile(e.dataTransfer.files[0]);
    }
  };

  const handleCoverFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCoverFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleCoverClick = () => {
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
      coverInputRef.current.click();
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage("");
  };

  const handleCreateChapter = async () => {
    if (!chapterName.trim()) {
      toastQueue.add({
        title: "Missing Chapter Name",
        description: "Chapter Name is required.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    if (!chapterCode.trim()) {
      toastQueue.add({
        title: "Missing Chapter Code",
        description: "Chapter Code is required.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    // Validate cover image is not a blob URL
    if (coverImage && coverImage.startsWith('blob:')) {
      toastQueue.add({
        title: "Image Upload Pending",
        description: "Please wait for the image to finish uploading or try uploading again.",
        variant: "error",
      }, { timeout: 3000 });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: chapterName.trim(),
        code: chapterCode.trim(),
        city: city.trim(),
        country: country.trim(),
        cover_image: coverImage,
        venue_name: venueName.trim(),
        full_address: fullAddress.trim(),
        sort_order: sortOrder === "" ? undefined : sortOrder,
        notifications,
        team: teamMembers.length,
        team_members: teamMembers,
      };

      let res: Response;
      if (editData?.id) {
        res = await fetch(`/api/chapters/${editData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save chapter");
      }

      toastQueue.add({
        title: editData?.id ? "Chapter Updated" : "Chapter Created",
        description: editData?.id ? "Chapter updated successfully." : "Chapter details saved successfully.",
        variant: "success",
      }, { timeout: 3000 });

      onChapterSaved?.();
      onDismiss();
    } catch (err: any) {
      console.error("Save chapter error:", err);
      toastQueue.add({
        title: "Error",
        description: err.message || "Failed to save chapter.",
        variant: "error",
      }, { timeout: 3000 });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-[#ECEFF2] border border-[#D5DDE2] dark:bg-muted dark:border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
          {editData?.id ? "Edit Chapter" : "Create New Chapter"}
        </h1>
        <p className="text-base font-semibold text-muted-foreground leading-[18px]">
          Fill in all required fields to create a new chapter. All fields marked
          with * are mandatory.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center bg-[#ECEFF2] rounded-lg p-1 relative overflow-x-auto whitespace-nowrap w-max">
        {createChapterTabs.map((tab) => (
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
                layoutId="createChapterTabIndicator"
                className="absolute inset-0 bg-card rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* White Card */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
        {/* Basic Info Tab */}
        {activeTab === "Basic Info" && (
          <div className="flex flex-col gap-4">

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-foreground">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="eg. Dubai Chapter"
                  className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-foreground">
                  Chapter Code *
                </label>
                <input
                  type="text"
                  value={chapterCode}
                  onChange={(e) => setChapterCode(e.target.value)}
                  placeholder="eg. CH007"
                  className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-foreground">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="eg. Dubai"
                  className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-foreground">
                  Country *
                </label>
                <SearchableSelect
                  value={country}
                  onChange={setCountry}
                  options={COUNTRY_SELECT_OPTIONS}
                  placeholder="eg. UAE"
                />
              </div>
            </div>

            {/* Cover Image Dropzone */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">
                Cover Image
              </label>
              <div
                onDragOver={handleCoverDragOver}
                onDragLeave={handleCoverDragLeave}
                onDrop={handleCoverDrop}
                onClick={!coverImage && !uploadingImage ? handleCoverClick : undefined}
                className={`border border-dashed rounded-[14px] min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden transition-colors ${coverImage
                  ? "border-border"
                  : isDraggingCover
                    ? "bg-blue-50 border-[#3f52ff] dark:bg-blue-950/40 dark:border-[#8faeff] cursor-copy"
                    : "bg-card border-border cursor-pointer hover:border-muted-foreground/60"
                  }`}
              >
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  disabled={uploadingImage}
                />

                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#3f52ff]/30 border-t-[#3f52ff] rounded-full animate-spin" />
                    <span className="text-sm font-medium text-foreground">Uploading...</span>
                  </div>
                ) : coverImage ? (
                  <div className="relative w-full h-[160px] group">
                    <img
                      src={coverImage}
                      alt="Chapter cover"
                      className="absolute inset-0 h-full w-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e: any) => { e.stopPropagation(); handleCoverClick(); }}
                        className="p-2 bg-white/90 hover:bg-white text-foreground rounded-full transition-colors"
                        title="Replace image"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e: any) => { e.stopPropagation(); handleRemoveCoverImage(); }}
                        className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.44444" y="1.44444" width="49.1111" height="49.1111" rx="24.5556" fill="#3F52FF" />
                        <rect x="1.44444" y="1.44444" width="49.1111" height="49.1111" rx="24.5556" stroke="white" strokeWidth="2.88889" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M26 14.8055H25.9393C23.9619 14.8055 22.3947 14.8055 21.1438 14.9327C19.8611 15.0627 18.7908 15.3371 17.8548 15.9625C17.1071 16.4644 16.4644 17.1071 15.9625 17.8548C15.3357 18.7908 15.0627 19.8625 14.9327 21.1438C14.8055 22.3947 14.8055 23.9619 14.8055 25.9393V26.0607C14.8055 28.0381 14.8055 29.6053 14.9327 30.8562C15.0627 32.1389 15.3371 33.2092 15.9625 34.1452C16.4623 34.8949 17.1051 35.5377 17.8548 36.0374C18.7908 36.6643 19.8625 36.9373 21.1438 37.0673C22.3947 37.1944 23.9619 37.1944 25.9393 37.1944H26.0607C28.0381 37.1944 29.6053 37.1944 30.8562 37.0673C32.1389 36.9373 33.2092 36.6629 34.1452 36.0389C34.893 35.5366 35.5357 34.8934 36.0374 34.1452C36.6643 33.2092 36.9373 32.1374 37.0673 30.8562C37.1944 29.6053 37.1944 28.0381 37.1944 26.0607V25.9393C37.1944 23.9619 37.1944 22.3947 37.0673 21.1438C36.9373 19.8611 36.6629 18.7908 36.0389 17.8548C35.5366 17.107 34.8934 16.4643 34.1452 15.9625C33.2092 15.3357 32.1374 15.0627 30.8562 14.9327C29.6053 14.8055 28.0381 14.8055 26.0607 14.8055H26ZM29.3511 27.1339C29.5764 26.8305 30.4128 25.8801 31.4975 26.5561C32.188 26.9822 32.7687 27.5585 33.3898 28.1739C33.6267 28.4108 33.7942 28.6794 33.9083 28.9669C34.2463 29.8335 34.0701 30.8779 33.709 31.7373C33.5047 32.2374 33.1945 32.6873 32.7998 33.056C32.4051 33.4248 31.9352 33.7038 31.4224 33.8737C30.9628 34.0191 30.4832 34.0917 30.0011 34.0889H21.4789C20.631 34.0889 19.8813 33.8867 19.266 33.5068C18.8803 33.2684 18.8124 32.7195 19.0984 32.3642C19.5741 31.7701 20.0489 31.1721 20.5227 30.5702C21.4298 29.419 22.0408 29.0839 22.7211 29.3771C22.9955 29.4984 23.2729 29.6804 23.5574 29.8725C24.3158 30.3882 25.3702 31.096 26.7583 30.3275C27.7088 29.7945 28.2605 28.8831 28.7401 28.0872L28.7488 28.0728L28.8499 27.9067C29.0051 27.6416 29.1724 27.3837 29.3511 27.1339ZM19.9333 22.4611C19.9333 21.0672 21.0658 19.9333 22.4611 19.9333C23.1315 19.9333 23.7745 20.1996 24.2485 20.6737C24.7226 21.1477 24.9889 21.7907 24.9889 22.4611C24.9889 33.1315 24.7226 23.7745 24.2485 24.2485C23.7745 24.7226 23.1315 24.9889 22.4611 24.9889C21.0658 24.9889 19.9333 23.855 19.9333 22.4611Z" fill="white" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${isDraggingCover ? "text-[#3f52ff] dark:text-[#8faeff]" : "text-foreground"}`}>
                      {isDraggingCover ? "Drop to upload" : "Drag & drop or click to upload"}
                    </span>
                    <span className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, GIF, WebP · Up to 10MB</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Venue Tab */}
        {activeTab === "Venue" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left: Form Fields */}
              <div className="flex flex-col gap-4 w-full lg:w-[373px] shrink-0">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Search on map
                  </label>
                  <div className="relative w-full" ref={placesBoxRef}>
                    <input
                      type="text"
                      value={searchPlace}
                      onChange={(e) => {
                        setSearchPlace(e.target.value);
                        setIsPlacesOpen(true);
                      }}
                      onFocus={() => setIsPlacesOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchPlace) {
                          if (placePredictions.length > 0) {
                            const first = placePredictions[0];
                            selectPlace(first.place_id, first.description);
                            return;
                          }

                          geocodeAddress(searchPlace).then((ok) => {
                            toastQueue.add({
                              title: ok ? "Location Found" : "Location Not Found",
                              description: ok
                                ? `Mapped location to ${searchPlace}`
                                : "Try selecting a suggestion from the list.",
                              variant: ok ? "success" : "error",
                            }, { timeout: 3000 });
                          });
                        }
                      }}
                      placeholder="Search Places (eg. Central Park, NY)"
                      className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="Enter the vanue full address"
                    className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="eg. Burj Al-Arab"
                    className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
              </div>

              {/* Right: Map Preview */}
              <div className="flex-1 h-[215px] bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                {venueLatLng ? (
                  <img
                    src={`/api/places/static-map?lat=${venueLatLng.lat}&lng=${venueLatLng.lng}`}
                    alt="Map preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MapPin className="w-8 h-8" />
                    <span className="text-sm">Map preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Toast */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60 rounded-lg px-3 py-2 max-w-fit">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-300 shrink-0" />
              <span className="text-[13px] text-muted-foreground">
                Coordinates enable precise map location for events and mobile
                app integration
              </span>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "Team" && (
          <TeamTabContent members={teamMembers} setMembers={setTeamMembers} />
        )}

        {/* Setting Tab */}
        {activeTab === "Setting" && (
          <div className="flex flex-col gap-4">
            {/* Sort Order */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">
                Sort Order
              </label>
              <div className="relative w-full max-w-[460px]">
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSortOrder(next === "" ? "" : Number(next));
                  }}
                  placeholder="Enter sort order"
                  className="h-9 w-full px-3 pr-8 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0">
                  <button
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === "" ? 1 : prev + 1))}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0 leading-none"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7.5L6 4.5L9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === "" ? 0 : Math.max(0, prev - 1)))}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0 leading-none"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 6.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
                </svg>
                <span className="text-xs">Lower numbers appear first. Used for mobile app and dropdown ordering.</span>
              </div>
            </div>

            {/* Notification Defaults */}
            <div className="bg-muted rounded-lg p-3 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground leading-[18px]">
                  Notification Defaults
                </h3>
                <p className="text-xs text-muted-foreground leading-[18px]">
                  Configure automatic notifications for chapter members
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-foreground">Enable Notifications</span>
                  <AriaSwitch
                    isSelected={notifications.enableNotifications}
                    onChange={() => toggleNotification("enableNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-foreground">Auto-Notify New Events</span>
                  <AriaSwitch
                    isSelected={notifications.autoNotifyNewEvents}
                    onChange={() => toggleNotification("autoNotifyNewEvents")}
                  />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-foreground">Auto-Notify New Updates</span>
                  <AriaSwitch
                    isSelected={notifications.autoNotifyNewUpdates}
                    onChange={() => toggleNotification("autoNotifyNewUpdates")}
                  />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-foreground">Auto-Notify Announcements</span>
                  <AriaSwitch
                    isSelected={notifications.autoNotifyAnnouncements}
                    onChange={() => toggleNotification("autoNotifyAnnouncements")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleCreateChapter}
            disabled={creating}
            className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (editData?.id ? "Saving..." : "Creating...") : (editData?.id ? "Save Changes" : "Create Chapter")}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- View Chapter Panel ---
interface ViewChapterData {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  team: number;
  events: string;
  lastUpdate: string;
  coverImage?: string | null;
  venue_name?: string;
  full_address?: string;
  sort_order?: number;
  notifications?: {
    enableNotifications: boolean;
    autoNotifyNewEvents: boolean;
    autoNotifyNewUpdates: boolean;
    autoNotifyAnnouncements: boolean;
  };
  created_at?: string;
  team_members?: TeamMember[];
}

function ViewChapterPanel({
  chapter,
  onClose,
  onNavigate,
  onEdit,
}: {
  chapter: ViewChapterData;
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  onEdit?: () => void;
}) {
  const [notifications, setNotifications] = useState(
    chapter.notifications || {
      enableNotifications: false,
      autoNotifyNewEvents: true,
      autoNotifyNewUpdates: false,
      autoNotifyAnnouncements: true,
    }
  );

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const createdDate = chapter.created_at
    ? new Date(chapter.created_at).toLocaleDateString()
    : "—";

  const eventCount = (() => {
    const match = chapter.events.match(/\d+/);
    return match ? match[0] : "0";
  })();
  const mapQuery = (
    chapter.full_address ||
    chapter.venue_name ||
    `${chapter.city || ""} ${chapter.country || ""}`.trim()
  ).trim();
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : "https://www.google.com/maps";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);


  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close chapter drawer"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="relative z-[101] bg-white dark:bg-[#1a1f2e] rounded-l-[24px] w-[562px] h-full overflow-y-auto shadow-xl flex flex-col gap-6 py-4 pointer-events-auto"
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#22292f] flex items-center justify-center hover:bg-[#22292f]/80 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12L13 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate?.("prev")}
              className="w-8 h-8 rounded-lg bg-[#f0f2f5] flex items-center justify-center hover:bg-[#e3e8ed] transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-[#668091]" />
            </button>
            <button
              onClick={() => onNavigate?.("next")}
              className="w-8 h-8 rounded-lg bg-[#f0f2f5] flex items-center justify-center hover:bg-[#e3e8ed] transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-[#668091]" />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mx-4 w-[530px] h-[257px] min-h-[257px] shrink-0 rounded-[12px] bg-gradient-to-b from-[#4a6fa5] to-[#2d3e50] relative overflow-hidden flex flex-col justify-end p-4">
          {chapter.coverImage && !chapter.coverImage.startsWith("blob:") ? (
            <img
              src={chapter.coverImage}
              alt={chapter.name}
              className="absolute inset-0 w-full h-full object-cover rounded-[12px]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 rounded-[12px]" />
          <div className="relative flex items-end justify-between w-full gap-2.5">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-[20px] font-semibold text-[#d8e6ff] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {chapter.name} Chapter
              </span>
              <span className="text-[16px] text-[#d8e6ff] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {chapter.city}{chapter.city && chapter.country ? ", " : ""}{chapter.country}
              </span>
            </div>
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors shrink-0"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Basic Information
          </span>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Chapter ID</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{chapter.code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Sort Order</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{chapter.sort_order ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Created</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{createdDate}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Last Updated</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{chapter.lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-[#ECEFF2] -my-3 shrink-0" />

        {/* Venue Information */}
        <div className="flex flex-col gap-6 px-4">
          <div className="flex items-start justify-between">
            <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              Venue Information
            </span>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22292f] text-white text-xs font-medium rounded-lg hover:bg-[#22292f]/90 transition-colors"
            >
              View on maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1 shrink-0">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Venue Name</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{chapter.venue_name || "Not set"}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Address</span>
              <span className="text-[16px] text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{chapter.full_address || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-[#ECEFF2] -my-3 shrink-0" />

        {/* Chapter Story */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Chapter Story
          </span>
          <p className="text-[14px] font-semibold text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            The {chapter.name} Chapter brings together professionals and enthusiasts in the heart of {chapter.city}. Join us for networking events, workshops, and community building.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-[#ECEFF2] -my-3 shrink-0" />

        {/* Team Members */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Team Members
          </span>
          {(chapter.team_members || []).length > 0 ? (
            <div className="flex flex-col gap-2">
              {(chapter.team_members || []).map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-[9px] overflow-hidden bg-[#d8e6ff] flex items-center justify-center shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <CircleUserRound className="w-4 h-4 text-[#3f52ff]" />
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[16px] font-semibold text-[#22292f] leading-[18px] truncate" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                      {member.name}
                    </span>
                    <span className="text-[14px] text-[#668091] leading-[18px] truncate" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                      {member.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : chapter.team > 0 ? (
            <div className="flex items-center gap-2">
              <div className="bg-[#d8e6ff] rounded-[9px] p-3 flex items-center justify-center">
                <CircleUserRound className="w-4 h-4 text-[#3f52ff]" />
              </div>
              <span className="text-[16px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {chapter.team} team member{chapter.team !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <span className="text-[14px] text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              No team members assigned yet
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-[#ECEFF2] -my-3 shrink-0" />

        {/* Notifications Default */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Notifications Default
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#22292f]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Enable Notifications</span>
              <AriaSwitch
                isSelected={notifications.enableNotifications}
                onChange={() => toggleNotification("enableNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#22292f]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Auto-Notify New Events</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewEvents}
                onChange={() => toggleNotification("autoNotifyNewEvents")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#22292f]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Auto-Notify New Updates</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewUpdates}
                onChange={() => toggleNotification("autoNotifyNewUpdates")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#22292f]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Auto-Notify Announcements</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyAnnouncements}
                onChange={() => toggleNotification("autoNotifyAnnouncements")}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-[#ECEFF2] -my-3 shrink-0" />

        {/* Linked Events */}
        <div className="flex flex-col gap-6 px-4 pb-4">
          <span className="text-[20px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Linked Events
          </span>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#22292f] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {eventCount} Events linked to this chapter
              </span>
              <span className="text-[14px] text-[#668091] leading-[18px]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                Events use this chapter for filtering and mobile display
              </span>
            </div>
            <button className="px-3 py-1.5 bg-[#22292f] text-white text-xs font-medium rounded-lg hover:bg-[#22292f]/90 transition-colors shrink-0">
              View Events
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ChapterActionMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu>
      <MenuButton className="p-1 hover:bg-muted/70 rounded transition-colors focus:outline-none">
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </MenuButton>

      <Portal>
        <MenuItems
          anchor="bottom end"
          transition
          className="z-[100] mt-1 bg-card border border-border rounded-lg shadow-lg min-w-[120px] py-1 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
        >
          <MenuItem>
            <button
              onClick={onView}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground data-[focus]:bg-muted/70 hover:bg-muted/70 transition-colors focus:outline-none"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
              View
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground data-[focus]:bg-muted/70 hover:bg-muted/70 transition-colors focus:outline-none"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive data-[focus]:bg-destructive/10 hover:bg-destructive/10 transition-colors focus:outline-none"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
              Delete
            </button>
          </MenuItem>
        </MenuItems>
      </Portal>
    </Menu>
  );
}

// --- DB chapter shape ---
interface ChapterRow {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  team: number;
  events: string;
  visible: boolean;
  status: string;
  cover_image?: string;
  venue_name?: string;
  full_address?: string;
  sort_order?: number;
  notifications?: any;
  team_members?: TeamMember[];
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// --- Chapters Content ---
function ChaptersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editChapterData, setEditChapterData] = useState<EditChapterData | null>(null);
  const [chaptersData, setChaptersData] = useState<ChapterRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteChapter, setDeleteChapter] = useState<{
    id: string;
    name: string;
    code: string;
    events: string;
  } | null>(null);
  const [viewChapter, setViewChapter] = useState<ViewChapterData | null>(null);

  const [visibleStates, setVisibleStates] = useState<Record<string, boolean>>({});
  const getChapterTeamMembers = (chapter: any): TeamMember[] => {
    if (Array.isArray(chapter?.team_members)) return chapter.team_members;
    if (Array.isArray(chapter?.notifications?.team_members)) {
      return chapter.notifications.team_members;
    }
    return [];
  };

  // Fetch chapters from API
  const fetchChapters = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/chapters");
      const result = await res.json();
      if (result.success && result.data) {
        // Normalize DB field names (some chapters may use chapter_name/chapter_code)
        const normalized = result.data.map((ch: any) => {
          const chapterTeamMembers = getChapterTeamMembers(ch);
          return {
          ...ch,
          name: ch.chapter_name || ch.name || "",
          code: ch.chapter_code || ch.code || ch.id?.substring(0, 8) || "",
          city: ch.city || "",
          country: ch.country || "",
          events: ch.events || "0 Events",
          team: ch.team_member_count || ch.team || chapterTeamMembers.length || 0,
          status: ch.status || "Active",
          visible: ch.visible !== false,
          team_members: chapterTeamMembers,
          };
        });
        setChaptersData(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load chapters on mount
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Sync visibleStates when chaptersData changes
  useEffect(() => {
    setVisibleStates(Object.fromEntries(chaptersData.map((c) => [c.id, c.visible])));
  }, [chaptersData]);

  const toggleVisible = async (chapter: ChapterRow) => {
    const newVisible = !visibleStates[chapter.id];
    setVisibleStates((prev) => ({ ...prev, [chapter.id]: newVisible }));
    try {
      await fetch(`/api/chapters/${chapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: newVisible }),
      });
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
      // Revert on error
      setVisibleStates((prev) => ({ ...prev, [chapter.id]: !newVisible }));
    }
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapter) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/chapters/${deleteChapter.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete chapter");
      }
      toastQueue.add({
        title: "Chapter Deleted",
        description: `"${deleteChapter.name}" has been deleted.`,
        variant: "success",
      }, { timeout: 3000 });
      setDeleteChapter(null);
      fetchChapters();
    } catch (err: any) {
      console.error("Delete chapter error:", err);
      toastQueue.add({
        title: "Error",
        description: err.message || "Failed to delete chapter.",
        variant: "error",
      }, { timeout: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const tableHeaders = [
    "Chapter",
    "Location",
    "Team",
    "Events",
    "Visible",
    "Status",
    "Last Update",
    "Action",
  ];

  if (showCreateForm) {
    return (
      <CreateChapterForm
        onDismiss={() => { setShowCreateForm(false); setEditChapterData(null); }}
        onChapterSaved={fetchChapters}
        editData={editChapterData}
      />
    );
  }

  // Extract event count number from string like "12 Events"
  const getEventCount = (events: string) => {
    const match = events.match(/\d+/);
    return match ? match[0] : "0";
  };

  const filteredChapters = chaptersData.filter(chapter => {
    const query = searchQuery.toLowerCase();
    return (
      (chapter.name || "").toLowerCase().includes(query) ||
      (chapter.city || "").toLowerCase().includes(query) ||
      (chapter.country || "").toLowerCase().includes(query) ||
      (chapter.code || "").toLowerCase().includes(query)
    );
  });

  const handleRowClick = (chapter: any) => {
    setViewChapter({
      id: chapter.id,
      name: chapter.name,
      code: chapter.code,
      city: chapter.city,
      country: chapter.country,
      team: chapter.team,
      events: chapter.events,
      lastUpdate: chapter.updated_at ? new Date(chapter.updated_at).toLocaleDateString() : "—",
      coverImage: chapter.cover_image,
      venue_name: chapter.venue_name || "",
      full_address: chapter.full_address || "",
      sort_order: chapter.sort_order ?? 999,
      notifications: chapter.notifications || {
        enableNotifications: false,
        autoNotifyNewEvents: true,
        autoNotifyNewUpdates: false,
        autoNotifyAnnouncements: true,
      },
      created_at: chapter.created_at,
      team_members: getChapterTeamMembers(chapter),
    });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (!viewChapter) return;
    const currentIndex = filteredChapters.findIndex(
      (ch: any) => ch.code === viewChapter.code && ch.name === viewChapter.name
    );
    if (currentIndex === -1) return;
    const nextIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= filteredChapters.length) return;
    const nextChapter = filteredChapters[nextIndex];
    handleRowClick(nextChapter);
  };

  const openEditChapter = (chapter: ChapterRow | ViewChapterData) => {
    setEditChapterData({
      id: chapter.id,
      name: chapter.name,
      code: chapter.code,
      city: chapter.city,
      country: chapter.country,
      cover_image: (
        "cover_image" in chapter
          ? chapter.cover_image
          : ("coverImage" in chapter ? chapter.coverImage : undefined)
      ) ?? undefined,
      venue_name: chapter.venue_name,
      full_address: chapter.full_address,
      sort_order: chapter.sort_order,
      notifications: chapter.notifications,
      team_members: getChapterTeamMembers(chapter),
    });
    setViewChapter(null);
    setShowCreateForm(true);
  };

  return (
    <>
      <div className="bg-[#ECEFF2] border border-[#D5DDE2] dark:bg-muted dark:border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 px-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
            Chapters Management
          </h1>
          <p className="text-base font-semibold text-muted-foreground leading-[18px]">
            Create and manage chapters for event segmentation and storytelling
          </p>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <StatCard
            icon={<Tags className="w-4 h-4 text-muted-foreground" />}
            title="Total Chapters"
            mobileTitle={
              <>
                Total
                <br />
                Chapters
              </>
            }
            subtitle="All chapters in organization"
            value={chaptersData.length}
            mobileTopValue
            isFirst
          />
          <StatCard
            icon={<Tag className="w-4 h-4 text-muted-foreground" />}
            title="Active Chapters"
            mobileTitle={
              <>
                Active
                <br />
                Chapters
              </>
            }
            subtitle="Currently operational"
            value={chaptersData.filter(c => c.status === "Active").length}
            mobileTopValue
          />
          <StatCard
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            title="Visible in App"
            mobileTitle={
              <>
                Visible
                <br />
                in App
              </>
            }
            subtitle="Shown to mobile users"
            value={chaptersData.filter(c => c.visible).length}
            mobileTopValue
          />
          <StatCard
            icon={<Link2 className="w-4 h-4 text-muted-foreground" />}
            title="Linked Events"
            mobileTitle={
              <>
                Linked
                <br />
                Events
              </>
            }
            subtitle="Total events across chapters"
            value={chaptersData.reduce((sum, c) => sum + (parseInt(c.events) || 0), 0)}
            mobileTopValue
            isLast
          />
        </div>

        {/* White Card - Table Section */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground leading-[18px]">
              All Chapters
            </span>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Chapter
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg w-full sm:w-[373px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chapter name, city or country"
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none p-0 focus:ring-0"
            />
            <kbd className="bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto hide-scrollbar">
            <table className="w-full min-w-[720px] table-auto">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-[#ECEFF2]">
                <tr className="[&>th]:bg-[#ECEFF2] [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="h-9 px-3 py-2 text-left text-sm font-medium text-foreground"
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {header !== "Action" && (
                          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading chapters...
                    </td>
                  </tr>
                ) : chaptersData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-12 h-12 rounded-full bg-[#3f52ff]/10 flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-[#3f52ff]" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">No chapters found</h3>
                        <p className="text-xs text-muted-foreground text-center max-w-[200px] mb-4">
                          Create your first chapter to start managing your communities.
                        </p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Create First Chapter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredChapters
                  .map((chapter) => (
                    <tr
                      key={chapter.id}
                      className="border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(chapter)}
                    >
                      {/* Chapter */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {chapter.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chapter.code}
                          </span>
                        </div>
                      </td>
                      {/* Location */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {chapter.city}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chapter.country}
                          </span>
                        </div>
                      </td>
                      {/* Team */}
                      <td className="px-3 py-3 text-sm text-foreground">
                        {chapter.team}
                      </td>
                      {/* Events */}
                      <td className="px-3 py-3 text-sm text-foreground">
                        {chapter.events}
                      </td>
                      {/* Visible Toggle */}
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <AriaSwitch
                          isSelected={visibleStates[chapter.id]}
                          onChange={() => toggleVisible(chapter)}
                        />
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        {(() => {
                          const isActive = chapter.status === "Active";
                          return (
                            <span
                              className={`inline-flex items-center gap-2 bg-card border border-[#D5DDE2] rounded-[8px] px-3 py-1 text-sm font-medium ${
                                isActive
                                  ? "text-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {isActive ? (
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                  <path d="M1.39553 4.96011C1.28658 4.46715 1.30372 3.95468 1.44538 3.4701C1.58703 2.98553 1.84862 2.54451 2.20594 2.18786C2.56326 1.83121 3.00476 1.57044 3.4896 1.42969C3.97443 1.28893 4.48694 1.27274 4.97969 1.38261C5.25105 0.958695 5.62471 0.609869 6.06625 0.368254C6.50779 0.126639 7.00303 0 7.50636 0C8.00969 0 8.50492 0.126639 8.94647 0.368254C9.38801 0.609869 9.76167 0.958695 10.033 1.38261C10.5266 1.27149 11.0403 1.28708 11.5262 1.42792C12.0121 1.56875 12.4545 1.83026 12.8122 2.18809C13.1698 2.54591 13.4311 2.98842 13.5717 3.47442C13.7124 3.96041 13.7277 4.47409 13.6164 4.96761C14.0408 5.23885 14.3901 5.6126 14.6321 6.0544C14.8741 6.49619 15.0009 6.9918 15.0009 7.49552C15.0009 7.99925 14.8741 8.49486 14.6321 8.93665C14.3901 9.37844 14.0408 9.7522 13.6164 10.0234C13.7267 10.5161 13.7109 11.0286 13.5705 11.5135C13.4301 11.9984 13.1696 12.44 12.8132 12.7975C12.4567 13.155 12.0158 13.4167 11.5313 13.5585C11.0467 13.7002 10.5343 13.7174 10.0414 13.6084C9.77039 14.0342 9.39641 14.3846 8.95403 14.6275C8.51165 14.8703 8.01516 14.9976 7.51053 14.9976C7.00589 14.9976 6.5094 14.8703 6.06702 14.6275C5.62464 14.3846 5.25066 14.0342 4.97969 13.6084C4.48687 13.7191 3.97409 13.7034 3.48893 13.5629C3.00378 13.4224 2.56198 13.1616 2.20454 12.8048C1.84709 12.4479 1.5856 12.0066 1.44431 11.5216C1.30302 11.0367 1.28653 10.5239 1.39636 10.0309C0.968646 9.76041 0.616321 9.38608 0.372176 8.94278C0.12803 8.49947 0 8.00161 0 7.49552C0 6.98944 0.12803 6.49158 0.372176 6.04827C0.616321 5.60497 0.968646 5.23064 1.39636 4.96011H1.39553Z" fill="#10A949" />
                                  <path d="M10.4327 5.24399C10.589 5.40026 10.6767 5.61219 10.6767 5.83316C10.6767 6.05413 10.589 6.26605 10.4327 6.42232L7.09941 9.75565C6.94313 9.91188 6.73121 9.99964 6.51024 9.99964C6.28927 9.99964 6.07735 9.91188 5.92107 9.75565L4.25441 8.08899C4.17482 8.01212 4.11133 7.92016 4.06766 7.81849C4.02398 7.71682 4.00099 7.60747 4.00003 7.49682C3.99907 7.38617 4.02015 7.27644 4.06206 7.17403C4.10396 7.07161 4.16583 6.97857 4.24408 6.90033C4.32232 6.82208 4.41536 6.7602 4.51778 6.7183C4.62019 6.6764 4.72992 6.65532 4.84057 6.65628C4.95122 6.65724 5.06057 6.68023 5.16224 6.7239C5.26391 6.76758 5.35587 6.83106 5.43274 6.91066L6.51024 7.98816L9.25441 5.24399C9.41068 5.08776 9.6226 5 9.84357 5C10.0645 5 10.2765 5.08776 10.4327 5.24399Z" fill="white" />
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                  <path d="M2.56667 5.74669C2.46937 5.30837 2.48431 4.85259 2.61011 4.42158C2.73591 3.99058 2.9685 3.59832 3.28632 3.28117C3.60413 2.96402 3.99688 2.73225 4.42814 2.60735C4.85941 2.48245 5.31523 2.46847 5.75334 2.56669C5.99448 2.18956 6.32668 1.8792 6.71931 1.66421C7.11194 1.44923 7.55237 1.33655 8.00001 1.33655C8.44764 1.33655 8.88807 1.44923 9.28071 1.66421C9.67334 1.8792 10.0055 2.18956 10.2467 2.56669C10.6855 2.46804 11.1421 2.48196 11.574 2.60717C12.006 2.73237 12.3992 2.96478 12.7172 3.28279C13.0352 3.6008 13.2677 3.99407 13.3929 4.42603C13.5181 4.85798 13.532 5.31458 13.4333 5.75336C13.8105 5.9945 14.1208 6.32669 14.3358 6.71933C14.5508 7.11196 14.6635 7.55239 14.6635 8.00002C14.6635 8.44766 14.5508 8.88809 14.3358 9.28072C14.1208 9.67336 13.8105 10.0056 13.4333 10.2467C13.5316 10.6848 13.5176 11.1406 13.3927 11.5719C13.2678 12.0032 13.036 12.3959 12.7189 12.7137C12.4017 13.0315 12.0094 13.2641 11.5784 13.3899C11.1474 13.5157 10.6917 13.5307 10.2533 13.4334C10.0125 13.8119 9.68006 14.1236 9.28676 14.3396C8.89346 14.5555 8.45202 14.6687 8.00334 14.6687C7.55466 14.6687 7.11322 14.5555 6.71992 14.3396C6.32662 14.1236 5.99417 13.8119 5.75334 13.4334C5.31523 13.5316 4.85941 13.5176 4.42814 13.3927C3.99688 13.2678 3.60413 13.036 3.28632 12.7189C2.9685 12.4017 2.73591 12.0095 2.61011 11.5785C2.48431 11.1475 2.46937 10.6917 2.56667 10.2534C2.18664 10.0129 1.87362 9.68014 1.65671 9.28617C1.4398 8.8922 1.32605 8.44976 1.32605 8.00002C1.32605 7.55029 1.4398 7.10785 1.65671 6.71388C1.87362 6.31991 2.18664 5.9872 2.56667 5.74669Z" fill="#E22023" />
                                  <path d="M8 10.6667V8" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M8 5.33331H8.00667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                              {chapter.status}
                            </span>
                          );
                        })()}
                      </td>
                      {/* Last Update */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {chapter.updated_at ? new Date(chapter.updated_at).toLocaleDateString() : "—"}
                          </span>
                          {chapter.updated_by && (
                            <span className="text-xs text-muted-foreground">
                              {chapter.updated_by}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <ChapterActionMenu
                          onView={() => handleRowClick(chapter)}
                          onEdit={() => openEditChapter(chapter)}
                          onDelete={() => {
                            setDeleteChapter({
                              id: chapter.id,
                              name: chapter.name,
                              code: chapter.code,
                              events: chapter.events,
                            });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* View Chapter Panel */}
      <AnimatePresence>
        {viewChapter && (
          <ViewChapterPanel
            chapter={viewChapter}
            onClose={() => setViewChapter(null)}
            onNavigate={handleNavigate}
            onEdit={() => openEditChapter(viewChapter)}
          />
        )}
      </AnimatePresence>

      {/* Delete Chapter Confirmation Modal */}
      {deleteChapter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteChapter(null)}
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
                  Delete Chapter
                </span>
              </div>
              <button
                onClick={() => setDeleteChapter(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-4">
              <p className="text-sm font-semibold text-muted-foreground leading-[20px]">
                <span className="font-bold text-foreground">
                  &quot;{deleteChapter.name} Chapter&quot;
                </span>{" "}
                has {getEventCount(deleteChapter.events)} linked events. Deleting
                this chapter will remove the chapter reference from those events.
                Are you sure you want to continue?
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-border">
              <button
                onClick={() => setDeleteChapter(null)}
                className="flex-1 h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted/70 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleDeleteChapter}
                disabled={isDeleting}
                className="flex-1 h-10 px-4 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Chapter"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
