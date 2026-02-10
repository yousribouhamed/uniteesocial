"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AriaSwitch } from "@/components/ui/aria-switch";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { motion } from "framer-motion";
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
  CheckCircle2,
  Plus,
  Info,
  MapPin,
  CircleUserRound,
  X,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Calendar, // Added for ModuleItem
  Ticket, // Added for ModuleItem
  CalendarDays, // Added for ModuleItem
  MessageSquare, // Added for ModuleItem
  Users, // Added for ModuleItem
} from "lucide-react";
import AdminSidebar, { type CurrentUser } from "@/components/admin-sidebar";
import { toastQueue } from "@/components/ui/aria-toast";
import { DEFAULT_CHAPTERS } from "@/data/chapters";

import { getBusinessProfile, updateBusinessProfile, uploadBrandAsset } from "./actions";
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
    <div className="flex min-h-screen bg-background font-[family-name:'Instrument_Sans',sans-serif] text-foreground">
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 py-3 bg-card border-b border-border">
          <nav className="flex items-center gap-0.5 text-sm">
            <span className="text-muted-foreground font-medium px-1 py-0.5">
              <Building2 className="w-4 h-4 inline mr-1" />
            </span>
            <span className="text-muted-foreground font-medium px-1 py-0.5">Business Profile</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium px-1 py-0.5">General Settings</span>
          </nav>
          <div className="bg-muted rounded-full p-[7px]">
            <Bell className="w-[17px] h-[17px] text-foreground" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-6">
          <div className="flex flex-col gap-2">
            {/* Top Tabs - Tenant Setup, Social Links, Legal and T&C, Chapters */}
            <div className="inline-flex items-center bg-muted rounded-lg p-1 relative self-start w-fit">
              {topTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTopTab(tab)}
                  className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeTopTab === tab
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
              <div className="bg-muted border border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
                {/* Section Header */}
                <div className="flex flex-col gap-2 px-2">
                  <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
                    About Business
                  </h1>
                  <p className="text-base font-semibold text-muted-foreground leading-[18px]">
                    Configure your business information and settings
                  </p>
                </div>

                {/* Inner Tabs - General Setting, Branding, Modules */}
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center bg-muted rounded-lg p-1 relative self-start w-max">
                    {innerTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveInnerTab(tab)}
                        className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeInnerTab === tab
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

  return (
    <div className="flex flex-col gap-2 flex-1 relative">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div
        className="flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg cursor-pointer hover:border-muted-foreground/60 transition-colors"
        onClick={() => setShowPicker(!showPicker)}
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
      {showPicker && (
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

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">General Settings</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Manage your business profile information
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

      {/* Business Info Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
            <AriaSelect
              aria-label="Select Time Zone"
              selectedKey={formData.timezone}
              onSelectionChange={(k) => setFormData({ ...formData, timezone: k as string })}
              className="w-full"
            >
              {TIMEZONES.map((tz) => (
                <AriaSelectItem key={tz} id={tz} textValue={tz}>
                  {tz}
                </AriaSelectItem>
              ))}
            </AriaSelect>
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
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Domains</span>
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
              className={inputEditClass + " w-full max-w-md"}
            />
          ) : (
            <div className={inputReadOnlyClass + " flex items-center w-full max-w-md"}>
              {formData.domain || <span className="text-muted-foreground">Not set</span>}
            </div>
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
  );
}


// --- Image Upload Component ---
function ImageUploadArea({
  label,
  value,
  onUpload,
  disabled = false,
}: {
  label: string;
  value?: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
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
        className={`border border-dashed rounded-[14px] min-h-[160px] flex flex-col items-center justify-center px-4 py-5 relative overflow-hidden transition-colors ${disabled ? "bg-muted border-border cursor-not-allowed pointer-events-none" :
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
          <div className="relative w-full h-full min-h-[120px] flex items-center justify-center group">
            <img
              src={value}
              alt={label}
              className="max-h-[140px] w-auto object-contain rounded-md shadow-sm"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                <div className="flex flex-col items-center text-white gap-1">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">Change Image</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`w-11 h-11 rounded-full border border-border flex items-center justify-center mb-2 ${isDragging ? "bg-card" : ""}`}>
              <Upload className={`w-4 h-4 ${isDragging ? "text-[#3f52ff] dark:text-[#8faeff]" : "text-muted-foreground opacity-60"}`} />
            </div>
            <span className={`text-sm font-medium ${isDragging ? "text-[#3f52ff] dark:text-[#8faeff]" : "text-foreground"}`}>
              {isDragging ? "Drop to upload" : "Upload image"}
            </span>
            <span className="text-xs text-muted-foreground/70 mt-1">All files · Up to 10MB</span>
          </>
        )}
      </div>
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

  // Local state for images, separate from colors since they might be stored separately
  const [images, setImages] = useState({
    web_login_image: "",
    home_background_image: "",
  });

  const [savedColors, setSavedColors] = useState(colors);
  const [savedImages, setSavedImages] = useState(images);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      // initialData is the full profile object
      // colors is stored as JSON string or object in the database
      // web_login_image and home_background_image are separate TEXT columns

      const { colors: colorsData, web_login_image, home_background_image } = initialData;

      // Parse colors if it's a JSON string, otherwise use as object
      if (colorsData) {
        const parsedColors = typeof colorsData === 'string' ? JSON.parse(colorsData) : colorsData;
        setColors((prev) => ({ ...prev, ...parsedColors }));
        setSavedColors((prev) => ({ ...prev, ...parsedColors }));
      }

      // Set images from the profile
      setImages({
        web_login_image: web_login_image || "",
        home_background_image: home_background_image || ""
      });
      setSavedImages({
        web_login_image: web_login_image || "",
        home_background_image: home_background_image || ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSave = async () => {
    try {
      // Structure the payload correctly for the database
      // colors is stored as JSON, images are stored as separate TEXT columns
      const result = await updateBusinessProfile({
        colors: JSON.stringify(colors),
        web_login_image: images.web_login_image || null,
        home_background_image: images.home_background_image || null
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Branding</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Customize your app&apos;s visual appearance
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

      {/* Logo Uploads - Kept static for now as requested only for the two specific bottom images */}
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Splash Screen Logo</span>
          <div
            aria-disabled={!isEditing}
            className={`w-16 h-16 rounded-full border border-dashed flex items-center justify-center transition-colors ${isEditing ? "border-border cursor-pointer hover:border-muted-foreground/60" : "border-border bg-muted pointer-events-none cursor-not-allowed"}`}
          >
            <User className="w-4 h-4 text-muted-foreground opacity-60" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Home Screen logo</span>
          <div
            aria-disabled={!isEditing}
            className={`w-16 h-16 rounded-full border border-dashed flex items-center justify-center transition-colors ${isEditing ? "border-border cursor-pointer hover:border-muted-foreground/60" : "border-border bg-muted pointer-events-none cursor-not-allowed"}`}
          >
            <User className="w-4 h-4 text-muted-foreground opacity-60" />
          </div>
        </div>
      </div>

      {/* Color Row 1: Primary Color + Invert Colors */}
      <div className="flex gap-4">
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
      <div className="flex gap-4">
        <ColorInput label="Secondary Color" value={colors.secondary} colorSwatch={colors.secondary} onColorChange={isEditing ? updateColor("secondary") : undefined} />
        <ColorInput label="Text Color" value={colors.text} colorSwatch={colors.text} onColorChange={isEditing ? updateColor("text") : undefined} />
      </div>

      {/* Color Row 3: Header BG + Chat BG + Header Icon + Chat Send Button */}
      <div className="flex gap-4">
        <ColorInput label="Header Background Colors" value={colors.headerBg} colorSwatch={colors.headerBg} onColorChange={isEditing ? updateColor("headerBg") : undefined} />
        <ColorInput label="Chat Background Screen Color" value={colors.chatBg} colorSwatch={colors.chatBg} onColorChange={isEditing ? updateColor("chatBg") : undefined} />
        <ColorInput label="Header Icon Color" value={colors.headerIcon} colorSwatch={colors.headerIcon} onColorChange={isEditing ? updateColor("headerIcon") : undefined} />
        <ColorInput label="Chat Send Button Color" value={colors.chatSend} colorSwatch={colors.chatSend} onColorChange={isEditing ? updateColor("chatSend") : undefined} />
      </div>

      {/* Image Uploads - Replaced with ImageUploadArea */}
      <div className="flex gap-4">
        <ImageUploadArea
          label="Web Login Image"
          value={images.web_login_image}
          onUpload={updateImage("web_login_image")}
          disabled={!isEditing}
        />
        <ImageUploadArea
          label="Home Background Image"
          value={images.home_background_image}
          onUpload={updateImage("home_background_image")}
          disabled={!isEditing}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full" />

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
      <span className="text-sm font-medium text-foreground">{label}</span>
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
    <div className="bg-muted border border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
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
        <div className="flex gap-4">
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
        <div className="flex gap-4">
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
    <div className="bg-muted border border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
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
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Modules</span>
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            Enable or disable features for your platform
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
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-4">
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
  isFirst,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string | number;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex-1 bg-card border border-border p-4 flex items-center justify-between -mr-px ${isFirst ? "rounded-l-lg" : ""
        } ${isLast ? "rounded-r-lg" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="bg-muted border border-border rounded-[5.4px] p-[7px] flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">
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
  );
}

// --- Team Tab Content ---
type TeamRole = "Member" | "Co-Lead" | "Chapter Lead";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
}

function TeamTabContent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("Member");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Danish",
      email: "danish.rasmussen@example.com",
      role: "Member",
    },
    {
      id: "2",
      name: "Hamid",
      email: "hamid.zahed@example.com",
      role: "Co-Lead",
    },
    {
      id: "3",
      name: "Yousri",
      email: "yybouhamed@gmail.com",
      role: "Chapter Lead",
    },
  ]);

  const addMember = () => {
    if (!fullName.trim() || !email.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
      },
    ]);
    setFullName("");
    setEmail("");
    setSelectedRole("Member");
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
        <div className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground/60 transition-colors">
          <User className="w-4 h-4 text-muted-foreground opacity-60" />
        </div>
      </div>

      {/* Add Member Row */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className="h-9 w-[180px] px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
          />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-9 w-[200px] px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
            />
          </div>
          <div className="relative">
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
                        ? "text-[#3f52ff] font-medium"
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
        <button
          onClick={addMember}
          className="h-9 px-4 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors whitespace-nowrap"
        >
          + Add team member
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-muted w-full" />

      {/* Team Members List */}
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onRemove={() => removeMember(member.id)}
            onRoleChange={(role) => updateMemberRole(member.id, role)}
            badgeClass={roleBadgeColor[member.role]}
          />
        ))}
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
    <div className="bg-card border border-border rounded-xl p-2 flex items-center justify-between max-w-[564px]">
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 border border-blue-300 dark:bg-blue-950/40 dark:border-blue-700/60 rounded-[9px] p-3 flex items-center justify-center">
          <CircleUserRound className="w-4 h-4 text-[#3f52ff] dark:text-[#8faeff]" />
        </div>
        <div className="flex flex-col gap-1">
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
          <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
            {member.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
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
                      ? "text-[#3f52ff] font-medium"
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

function CreateChapterForm({ onDismiss }: { onDismiss: () => void }) {
  const [activeTab, setActiveTab] = useState<CreateChapterTab>("Venue");
  const [venueName, setVenueName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [searchPlace, setSearchPlace] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterCode, setChapterCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  return (
    <div className="bg-muted border border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
          Create New Chapter
        </h1>
        <p className="text-base font-semibold text-muted-foreground leading-[18px]">
          Fill in all required fields to create a new chapter. All fields marked
          with * are mandatory.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center bg-muted rounded-lg p-1 relative">
        {createChapterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeTab === tab
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
            <div className="flex gap-4">
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
            <div className="flex gap-4">
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
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="eg. UAE"
                  className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Venue Tab */}
        {activeTab === "Venue" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {/* Left: Form Fields */}
              <div className="flex flex-col gap-4 w-[373px] shrink-0">
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
                    Search on map
                  </label>
                  <input
                    type="text"
                    value={searchPlace}
                    onChange={(e) => setSearchPlace(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchPlace) {
                        toastQueue.add({
                          title: "Location Found",
                          description: `Mapped location to ${searchPlace}`,
                          variant: "success",
                        }, { timeout: 3000 });
                      }
                    }}
                    placeholder="Search Places (eg. Central Park, NY)"
                    className="h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
              </div>

              {/* Right: Map Placeholder */}
              <div className="flex-1 min-h-[215px] bg-muted rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <MapPin className="w-8 h-8" />
                  <span className="text-sm">Map preview</span>
                </div>
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
          <TeamTabContent />
        )}

        {/* Setting Tab */}
        {activeTab === "Setting" && (
          <div className="flex flex-col gap-4 min-h-[200px] items-center justify-center text-muted-foreground">
            <span className="text-sm">Chapter settings will appear here</span>
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
          <button className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
            Create Chapter
          </button>
        </div>
      </div>
    </div>
  );
}

// --- View Chapter Panel ---
interface ViewChapterData {
  name: string;
  code: string;
  city: string;
  country: string;
  team: number;
  events: string;
  lastUpdate: string;
}

function ViewChapterPanel({
  chapter,
  onClose,
}: {
  chapter: ViewChapterData;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState({
    enableNotifications: false,
    autoNotifyNewEvents: true,
    autoNotifyNewUpdates: false,
    autoNotifyAnnouncements: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const eventCount = (() => {
    const match = chapter.events.match(/\d+/);
    return match ? match[0] : "0";
  })();

  const teamMembers = [
    { name: "Danish", email: "danish.rasmussen@example.com", role: "Member" },
    { name: "Hamid", email: "hamid.zahed@example.com", role: "Co-Lead" },
    { name: "Yousri", email: "yybouhamed@gmail.com", role: "Chapter Lead" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-3xl w-[562px] max-h-[90vh] overflow-y-auto shadow-xl flex flex-col gap-6 py-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mx-4 h-[257px] rounded-xl bg-gradient-to-b from-[#4a6fa5] to-[#2d3e50] relative overflow-hidden flex flex-col justify-end p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
          <div className="relative flex items-end justify-between w-full">
            <div className="flex flex-col gap-1">
              <span className="text-xl font-semibold text-[#d8e6ff] leading-[18px]">
                {chapter.name} Chapter
              </span>
              <span className="text-base text-[#d8e6ff] leading-[18px]">
                {chapter.country}
              </span>
            </div>
            <button className="px-3 py-1.5 bg-[#3f52ff] text-white text-xs font-medium rounded-lg hover:bg-[#3545e0] transition-colors">
              Edit
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-foreground leading-[18px]">
            Basic Information
          </span>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Chapter ID</span>
              <span className="text-base text-foreground leading-[18px]">{chapter.code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Sort Order</span>
              <span className="text-base text-foreground leading-[18px]">1</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Created</span>
              <span className="text-base text-foreground leading-[18px]">11/28/2025</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Last Updated</span>
              <span className="text-base text-foreground leading-[18px]">{chapter.lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-muted mx-4" />

        {/* Venue Information */}
        <div className="flex flex-col gap-6 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-foreground leading-[18px]">
              Venue Information
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:bg-foreground/90 transition-colors">
              View on maps
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Venue Name</span>
              <span className="text-base text-foreground leading-[18px]">Manhattan Community Center</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-semibold text-muted-foreground leading-[18px]">Address</span>
              <span className="text-base text-foreground leading-[18px]">123 Madison Avenue, {chapter.city}, {chapter.country}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-muted mx-4" />

        {/* Chapter Story */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-foreground leading-[18px]">
            Chapter Story
          </span>
          <p className="text-sm font-semibold text-muted-foreground leading-[18px]">
            The {chapter.name} Chapter brings together professionals and enthusiasts in the heart of {chapter.city}. Join us for networking events, workshops, and community building. Our vibrant community hosts monthly meetups, quarterly conferences, and annual galas that bring together industry leaders and innovators.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-muted mx-4" />

        {/* Team Members */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-foreground leading-[18px]">
            Team Members
          </span>
          <div className="flex flex-col gap-2">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="bg-card border border-border rounded-xl p-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 border border-blue-300 dark:bg-blue-950/40 dark:border-blue-700/60 rounded-[9px] p-3 flex items-center justify-center">
                    <CircleUserRound className="w-4 h-4 text-[#3f52ff] dark:text-[#8faeff]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-foreground leading-[18px]">
                      {member.name}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground leading-[18px]">
                      {member.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#3f52ff] text-white">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-muted mx-4" />

        {/* Notifications Default */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-foreground leading-[18px]">
            Notifications Default
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable Notifications</span>
              <AriaSwitch
                isSelected={notifications.enableNotifications}
                onChange={() => toggleNotification("enableNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-Notify New Events</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewEvents}
                onChange={() => toggleNotification("autoNotifyNewEvents")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-Notify New Updates</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewUpdates}
                onChange={() => toggleNotification("autoNotifyNewUpdates")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-Notify Announcements</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyAnnouncements}
                onChange={() => toggleNotification("autoNotifyAnnouncements")}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-muted mx-4" />

        {/* Linked Events */}
        <div className="flex flex-col gap-6 px-4 pb-2">
          <span className="text-xl font-semibold text-foreground leading-[18px]">
            Linked Events
          </span>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground leading-[18px]">
                {eventCount} Events linked to this chapter
              </span>
              <span className="text-sm text-muted-foreground leading-[18px]">
                Events use this chapter for filtering and mobile display
              </span>
            </div>
            <button className="px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:bg-foreground/90 transition-colors">
              View Events
            </button>
          </div>
        </div>
      </div>
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

// --- Chapters Content ---
function ChaptersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteChapter, setDeleteChapter] = useState<{
    name: string;
    code: string;
    events: string;
  } | null>(null);
  const [viewChapter, setViewChapter] = useState<{
    name: string;
    code: string;
    city: string;
    country: string;
    team: number;
    events: string;
    lastUpdate: string;
  } | null>(null);

  const chaptersData = DEFAULT_CHAPTERS;

  const [visibleStates, setVisibleStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(chaptersData.map((c) => [c.code, c.visible]))
  );

  const toggleVisible = (code: string) => {
    setVisibleStates((prev) => ({ ...prev, [code]: !prev[code] }));
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
    return <CreateChapterForm onDismiss={() => setShowCreateForm(false)} />;
  }

  // Extract event count number from string like "12 Events"
  const getEventCount = (events: string) => {
    const match = events.match(/\d+/);
    return match ? match[0] : "0";
  };

  return (
    <>
      <div className="bg-muted border border-border rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 px-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
            Chapters Management
          </h1>
          <p className="text-base font-semibold text-muted-foreground leading-[18px]">
            Create and manage chapters for event segmentation and storytelling
          </p>
        </div>

        {/* Stat Cards Row */}
        <div className="flex">
          <StatCard
            icon={<Tags className="w-4 h-4 text-muted-foreground" />}
            title="Total Chapters"
            subtitle="All chapters in organization"
            value={3}
            isFirst
          />
          <StatCard
            icon={<Tag className="w-4 h-4 text-muted-foreground" />}
            title="Active Chapters"
            subtitle="Currently operational"
            value={3}
          />
          <StatCard
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            title="Visible in App"
            subtitle="Shown to mobile users"
            value={2}
          />
          <StatCard
            icon={<Link2 className="w-4 h-4 text-muted-foreground" />}
            title="Linked Events"
            subtitle="Total events across chapters"
            value={20}
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
          <div className="flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg w-[373px]">
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
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
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
              <thead>
                <tr className="[&>th]:bg-muted [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
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
                {chaptersData
                  .filter(chapter => {
                    const query = searchQuery.toLowerCase();
                    return (
                      chapter.name.toLowerCase().includes(query) ||
                      chapter.city.toLowerCase().includes(query) ||
                      chapter.country.toLowerCase().includes(query) ||
                      chapter.code.toLowerCase().includes(query)
                    );
                  })
                  .map((chapter) => (
                    <tr
                      key={chapter.code}
                      className="border-b border-border last:border-b-0"
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
                      <td className="px-3 py-3">
                        <AriaSwitch
                          isSelected={visibleStates[chapter.code]}
                          onChange={() => toggleVisible(chapter.code)}
                        />
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {chapter.status}
                        </span>
                      </td>
                      {/* Last Update */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {chapter.lastUpdate}
                          </span>
                          {chapter.updatedBy && (
                            <span className="text-xs text-muted-foreground">
                              {chapter.updatedBy}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-3 py-3">
                        <ChapterActionMenu
                          onView={() => {
                            setViewChapter({
                              name: chapter.name,
                              code: chapter.code,
                              city: chapter.city,
                              country: chapter.country,
                              team: chapter.team,
                              events: chapter.events,
                              lastUpdate: chapter.lastUpdate,
                            });
                          }}
                          onEdit={() => {
                            // Edit logic if any, currently just placeholder in original
                          }}
                          onDelete={() => {
                            setDeleteChapter({
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
      {viewChapter && (
        <ViewChapterPanel
          chapter={viewChapter}
          onClose={() => setViewChapter(null)}
        />
      )}

      {/* Delete Chapter Confirmation Modal */}
      {deleteChapter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteChapter(null)}
          />
          <div className="relative bg-card border border-border rounded-xl w-[420px] flex flex-col gap-4 shadow-xl">
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
                onClick={() => setDeleteChapter(null)}
                className="flex-1 h-10 px-4 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
