"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AriaSwitch } from "@/components/ui/aria-switch";
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

import { getBusinessProfile, updateBusinessProfile } from "./actions";

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

  useEffect(() => {
    getBusinessProfile().then((data) => {
      if (data) setProfile(data);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f9fafb] font-[family-name:'Instrument_Sans',sans-serif]">
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-[#eceff2]">
          <nav className="flex items-center gap-0.5 text-sm">
            <span className="text-[#859bab] font-medium px-1 py-0.5">
              <Building2 className="w-4 h-4 inline mr-1" />
            </span>
            <span className="text-[#859bab] font-medium px-1 py-0.5">Business Profile</span>
            <ChevronRight className="w-4 h-4 text-[#859bab]" />
            <span className="text-[#859bab] font-medium px-1 py-0.5">General Settings</span>
          </nav>
          <div className="bg-[#d5dde2] rounded-full p-[7px]">
            <Bell className="w-[17px] h-[17px] text-[#22292f]" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-6">
          <div className="flex flex-col gap-2">
            {/* Top Tabs - Tenant Setup, Social Links, Legal and T&C, Chapters */}
            <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
              {topTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTopTab(tab)}
                  className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeTopTab === tab
                    ? "text-[#3f52ff]"
                    : "text-[#516778] hover:text-[#22292f]"
                    }`}
                >
                  {activeTopTab === tab && (
                    <motion.div
                      layoutId="topTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
              <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
                {/* Section Header */}
                <div className="flex flex-col gap-2 px-2">
                  <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
                    About Business
                  </h1>
                  <p className="text-base font-semibold text-[#859bab] leading-[18px]">
                    Configure your business information and settings
                  </p>
                </div>

                {/* Inner Tabs - General Setting, Branding, Modules */}
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
                    {innerTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveInnerTab(tab)}
                        className={`relative h-9 px-4 py-2 rounded-lg text-base font-medium transition-colors z-10 ${activeInnerTab === tab
                          ? "text-[#3f52ff]"
                          : "text-[#516778] hover:text-[#22292f]"
                          }`}
                      >
                        {activeInnerTab === tab && (
                          <motion.div
                            layoutId="innerTabIndicator"
                            className="absolute inset-0 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
                    <GeneralSettingContent initialData={profile} />
                  )}

                  {/* Content Card - Branding */}
                  {activeInnerTab === "Branding" && (
                    <BrandingContent initialData={profile?.colors} />
                  )}

                  {/* Content Card - Modules */}
                  {activeInnerTab === "Modules" && (
                    <ModulesContent initialData={profile?.modules} />
                  )}
                </div>
              </div>
            )}

            {activeTopTab === "Social Links" && (
              <SocialLinksContent initialData={profile?.social_links} />
            )}

            {activeTopTab === "Legal and T&C" && (
              <LegalAndTCContent initialData={profile} />
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
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const updateFromHsv = useCallback((h: number, s: number, v: number) => {
    setHsv([h, s, v]);
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setHexInput(hex);
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
      onChange(val.toUpperCase());
    }
  };

  const [r, g, b] = hsvToRgb(hsv[0], 1, 1);
  const hueColor = `rgb(${r},${g},${b})`;

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white border border-[#e4e4e4] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-3.5 w-[340px]"
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
        <button className="w-8 h-8 rounded-lg border border-[#e4e4e4] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0 hover:bg-[#f5f5f5] transition-colors">
          <Pipette className="w-3.5 h-3.5 text-[#22292f]" />
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
              className="absolute top-0 w-3.5 h-3.5 rounded-full bg-white border border-[rgba(24,24,29,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] -translate-x-1/2 pointer-events-none"
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
              className="absolute top-0 w-3.5 h-3.5 rounded-full bg-white border border-[rgba(24,24,29,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] -translate-x-1/2 pointer-events-none"
              style={{ left: `${opacity}%` }}
            />
          </div>
        </div>
      </div>

      {/* HEX Input Row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-between px-3 py-1.5 h-8 w-[72px] rounded-lg border border-[#e4e4e4] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] shrink-0">
          <span className="text-xs text-[rgba(9,9,9,0.9)]">HEX</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#70707d] opacity-50" />
        </div>
        <div className="flex flex-1 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="flex-1 h-7 px-2 py-1 bg-[#f5f5f5] border border-[#e4e4e4] rounded-l-lg text-sm text-[rgba(9,9,9,0.9)] outline-none"
          />
          <div className="relative h-7 w-[52px] bg-[#f5f5f5] border border-l-0 border-[#e4e4e4] rounded-r-lg flex items-center px-2">
            <span className="text-sm text-[rgba(9,9,9,0.9)]">{opacity}</span>
            <span className="absolute right-1.5 text-xs text-[#70707d]">%</span>
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
      <span className="text-sm font-semibold text-[#22292f]">{label}</span>
      <div
        className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg cursor-pointer hover:border-[#859bab] transition-colors"
        onClick={() => setShowPicker(!showPicker)}
      >
        <div
          className="w-5 h-5 rounded shrink-0"
          style={{ backgroundColor: colorSwatch }}
        />
        <span className="flex-1 text-sm text-[#22292f]">{value}</span>
        <Copy
          className="w-4 h-4 text-[#859bab] shrink-0 cursor-pointer hover:text-[#516778] transition-colors"
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
function GeneralSettingContent({ initialData }: { initialData?: ProfileData | null }) {
  const [formData, setFormData] = useState({
    business_name: "",
    poc_email: "",
    poc_name: "",
    timezone: "",
    domain: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        business_name: initialData.business_name || "",
        poc_email: initialData.poc_email || "",
        poc_name: initialData.poc_name || "",
        timezone: initialData.timezone || "",
        domain: initialData.domain || "",
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile(formData);
      toastQueue.add({
        title: "General Settings Saved",
        description: "Your general business settings have been updated.",
        variant: "success",
      }, { timeout: 3000 });
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save general settings.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  return (
    <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
      {/* Business Info Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#859bab]">Business Name</label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Eventy"
            className="h-9 px-3 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#859bab]">POC Email</label>
          <input
            type="email"
            value={formData.poc_email}
            onChange={(e) => setFormData({ ...formData, poc_email: e.target.value })}
            placeholder="eventy@gmail.com"
            className="h-9 px-3 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#859bab]">POC Name</label>
          <input
            type="text"
            value={formData.poc_name}
            onChange={(e) => setFormData({ ...formData, poc_name: e.target.value })}
            placeholder="Eventygo"
            className="h-9 px-3 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#859bab]">Time Zone</label>
          <input
            type="text"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            placeholder="UTC+00:00 — London"
            className="h-9 px-3 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff]"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#d5dde2] w-full" />

      {/* Domains Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">Domains</span>
          <span className="text-xs font-semibold text-[#859bab] leading-[18px]">
            Add and verify custom domains for your platform
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#859bab]">Domain</label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="www.eventy.com"
            className="h-9 px-3 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] w-full max-w-md"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}


// --- File Upload Component ---
function FileUploadArea({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <span className="text-sm font-semibold text-[#22292f]">{label}</span>
      <div className="border border-dashed border-[#d4d4d8] rounded-[14px] min-h-[160px] flex flex-col items-center justify-center px-4 py-5 bg-white cursor-pointer hover:border-[#859bab] transition-colors">
        <div className="w-11 h-11 rounded-full border border-[#e4e4e7] flex items-center justify-center mb-2">
          <Upload className="w-4 h-4 text-[#71717b] opacity-60" />
        </div>
        <span className="text-sm font-medium text-[#09090b]">Upload image</span>
        <span className="text-xs text-[#71717b]/70 mt-1">All files · Up to 10MB</span>
      </div>
    </div>
  );
}

// --- Branding Content ---
function BrandingContent({ initialData }: { initialData?: any }) {
  const [colors, setColors] = useState({
    primary: "#1F4E79",
    invert: "#00875A",
    secondary: "#2563EB",
    text: "#22292F",
    headerBg: "#1F4E79",
    chatBg: "#2563EB",
    headerIcon: "#00875A",
    chatSend: "#22292F",
  });

  useEffect(() => {
    if (initialData) {
      setColors((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ colors });
      toastQueue.add({
        title: "Branding Saved",
        description: "Your branding settings have been saved successfully.",
        type: "success"
      });
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save branding settings.",
        type: "error"
      });
    }
  };

  const updateColor = (key: keyof typeof colors) => (hex: string) => {
    setColors((prev) => ({ ...prev, [key]: hex }));
  };

  return (
    <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
      {/* Logo Uploads */}
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#22292f]">Splash Screen Logo</span>
          <div className="w-16 h-16 rounded-full border border-dashed border-[#d4d4d8] flex items-center justify-center cursor-pointer hover:border-[#859bab] transition-colors">
            <User className="w-4 h-4 text-[#71717b] opacity-60" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#22292f]">Home Screen logo</span>
          <div className="w-16 h-16 rounded-full border border-dashed border-[#d4d4d8] flex items-center justify-center cursor-pointer hover:border-[#859bab] transition-colors">
            <User className="w-4 h-4 text-[#71717b] opacity-60" />
          </div>
        </div>
      </div>

      {/* Color Row 1: Primary Color + Invert Colors */}
      <div className="flex gap-4">
        <ColorInput label="Primary Color" value={colors.primary} colorSwatch={colors.primary} onColorChange={updateColor("primary")} />
        <ColorInput label="Invert Colors" value={colors.invert} colorSwatch={colors.invert} onColorChange={updateColor("invert")} />
      </div>

      {/* Navigation/Icons hint */}
      <div className="flex items-center gap-1.5 text-sm text-[#859bab]">
        <div className="w-4 h-4 rounded-full border border-[#d5dde2] flex items-center justify-center">
          <span className="text-[10px]">i</span>
        </div>
        Navigations/Icons
      </div>

      {/* Color Row 2: Secondary Color + Text Color */}
      <div className="flex gap-4">
        <ColorInput label="Secondary Color" value={colors.secondary} colorSwatch={colors.secondary} onColorChange={updateColor("secondary")} />
        <ColorInput label="Text Color" value={colors.text} colorSwatch={colors.text} onColorChange={updateColor("text")} />
      </div>

      {/* Color Row 3: Header BG + Chat BG + Header Icon + Chat Send Button */}
      <div className="flex gap-4">
        <ColorInput label="Header Background Colors" value={colors.headerBg} colorSwatch={colors.headerBg} onColorChange={updateColor("headerBg")} />
        <ColorInput label="Chat Background Screen Color" value={colors.chatBg} colorSwatch={colors.chatBg} onColorChange={updateColor("chatBg")} />
        <ColorInput label="Header Icon Color" value={colors.headerIcon} colorSwatch={colors.headerIcon} onColorChange={updateColor("headerIcon")} />
        <ColorInput label="Chat Send Button Color" value={colors.chatSend} colorSwatch={colors.chatSend} onColorChange={updateColor("chatSend")} />
      </div>

      {/* Image Uploads */}
      <div className="flex gap-4">
        <FileUploadArea label="Web Login Image" />
        <FileUploadArea label="Home Background Image" />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#d5dde2] w-full" />

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
        >
          Save changes
        </button>
      </div>
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
          ? "bg-[#173254] border-[#173254]"
          : "bg-white border-[#d5dde2]"
          }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm font-medium text-[#09090b]">{label}</span>
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
        <div className="w-8 h-8 rounded-lg bg-[#f9fafb] border border-[#d5dde2] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#22292f]">{label}</span>
          <span className="text-xs font-semibold text-[#859bab] leading-[18px]">
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
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm font-semibold text-[#22292f]">{label}</label>
      <div className="flex items-center gap-2 h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg focus-within:border-[#3f52ff] transition-colors">
        <span className="shrink-0 text-[#859bab]">{icon}</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL"
          className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

// --- Social Links Content ---
function SocialLinksContent({ initialData }: { initialData?: any }) {
  const [links, setLinks] = useState({
    linkedin: "",
    xTwitter: "",
    instagram: "",
    tiktok: "",
  });

  useEffect(() => {
    if (initialData) {
      setLinks((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ social_links: links });
      toastQueue.add({
        title: "Social Links Saved",
        description: "Your social media links have been updated.",
        variant: "success",
      }, { timeout: 3000 });
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save social links.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const updateLink = (key: keyof typeof links) => (val: string) => {
    setLinks((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
          Social Links
        </h1>
        <p className="text-base font-semibold text-[#859bab] leading-[18px]">
          Manage your social media links and online presence
        </p>
      </div>

      {/* White Card */}
      <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
        {/* Row 1: LinkedIn + X / Twitter */}
        <div className="flex gap-4">
          <SocialLinkInput
            label="LinkedIn"
            icon={<Linkedin className="w-4 h-4" />}
            value={links.linkedin}
            onChange={updateLink("linkedin")}
          />
          <SocialLinkInput
            label="X / Twitter"
            icon={<XTwitterIcon className="w-4 h-4" />}
            value={links.xTwitter}
            onChange={updateLink("xTwitter")}
          />
        </div>

        {/* Row 2: Instagram + TikTok */}
        <div className="flex gap-4">
          <SocialLinkInput
            label="Instagram"
            icon={<Instagram className="w-4 h-4" />}
            value={links.instagram}
            onChange={updateLink("instagram")}
          />
          <SocialLinkInput
            label="TikTok"
            icon={<TikTokIcon className="w-4 h-4" />}
            value={links.tiktok}
            onChange={updateLink("tiktok")}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Legal and T&C Content ---
function LegalAndTCContent({ initialData }: { initialData?: any }) {
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.terms_url) setTermsUrl(initialData.terms_url);
      if (initialData.privacy_url) setPrivacyUrl(initialData.privacy_url);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ terms_url: termsUrl, privacy_url: privacyUrl });
      toastQueue.add({
        title: "Legal Documents Saved",
        description: "Your legal URLs have been updated.",
        variant: "success",
      }, { timeout: 3000 });
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save legal documents.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  return (
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
          Legal &amp; T&amp;C
        </h1>
        <p className="text-base font-semibold text-[#859bab] leading-[18px]">
          Manage your Legal &amp; T&amp;C documents and compliance settings
        </p>
      </div>

      {/* White Card */}
      <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
        {/* Terms & Conditions URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#22292f]">
            Terms &amp; Conditions URL
          </label>
          <div className="flex items-center gap-2 h-10 px-3 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
            <Link2 className="w-4 h-4 text-[#859bab] shrink-0" />
            <input
              type="url"
              value={termsUrl}
              onChange={(e) => setTermsUrl(e.target.value)}
              placeholder="Paste URL"
              className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Privacy Policy URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#22292f]">
            Privacy Policy URL
          </label>
          <div className="flex items-center gap-2 h-10 px-3 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
            <Link2 className="w-4 h-4 text-[#859bab] shrink-0" />
            <input
              type="url"
              value={privacyUrl}
              onChange={(e) => setPrivacyUrl(e.target.value)}
              placeholder="Paste URL"
              className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Modules Content ---
function ModulesContent({ initialData }: { initialData?: any }) {
  const [modules, setModules] = useState({
    events: false,
    tickets: false,
    calendarView: false,
    chat: false,
    exploreMembers: true,
    exploreCompany: true,
  });

  const [exploreMembersRadio, setExploreMembersRadio] = useState(0);
  const [exploreCompanyRadio, setExploreCompanyRadio] = useState(0);

  useEffect(() => {
    if (initialData) {
      setModules((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({ modules });
      toastQueue.add({
        title: "Modules Saved",
        description: "Your module settings have been updated.",
        variant: "success",
      }, { timeout: 3000 });
    } catch (e) {
      toastQueue.add({
        title: "Save Failed",
        description: "Failed to save modules settings.",
        variant: "error",
      }, { timeout: 4000 });
    }
  };

  const updateModule = (key: keyof typeof modules) => (checked: boolean) => {
    setModules((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <ModuleItem
          icon={<Calendar className="w-4 h-4 text-[#71717b]" />}
          label="Events"
          description="Create and manage events"
          action={<AriaSwitch isSelected={modules.events} onChange={updateModule("events")} />}
        />
        <ModuleItem
          icon={<Ticket className="w-4 h-4 text-[#71717b]" />}
          label="Tickets"
          description="Sell tickets for events"
          action={<AriaSwitch isSelected={modules.tickets} onChange={updateModule("tickets")} />}
        />
        <ModuleItem
          icon={<CalendarDays className="w-4 h-4 text-[#71717b]" />}
          label="Calendar View"
          description="Display events in a calendar view"
          action={<AriaSwitch isSelected={modules.calendarView} onChange={updateModule("calendarView")} />}
        />
        <ModuleItem
          icon={<MessageSquare className="w-4 h-4 text-[#71717b]" />}
          label="Chat"
          description="Enable chat for events"
          action={<AriaSwitch isSelected={modules.chat} onChange={updateModule("chat")} />}
        />
        <ModuleItem
          icon={<Users className="w-4 h-4 text-[#71717b]" />}
          label="Explore Members"
          description="Allow members to explore other members"
          action={
            <div className="flex items-center gap-4">
              <RadioOption
                selected={exploreMembersRadio === 0}
                onClick={() => setExploreMembersRadio(0)}
                label="All"
              />
              <RadioOption
                selected={exploreMembersRadio === 1}
                onClick={() => setExploreMembersRadio(1)}
                label="City Only"
              />
              <div className="h-6 w-px bg-[#d5dde2] mx-2" />
              <AriaSwitch isSelected={modules.exploreMembers} onChange={updateModule("exploreMembers")} />
            </div>
          }
        />
        <ModuleItem
          icon={<Building2 className="w-4 h-4 text-[#71717b]" />}
          label="Explore Company"
          description="Allow members to explore companies"
          action={
            <div className="flex items-center gap-4">
              <RadioOption
                selected={exploreCompanyRadio === 0}
                onClick={() => setExploreCompanyRadio(0)}
                label="All"
              />
              <RadioOption
                selected={exploreCompanyRadio === 1}
                onClick={() => setExploreCompanyRadio(1)}
                label="City Only"
              />
              <div className="h-6 w-px bg-[#d5dde2] mx-2" />
              <AriaSwitch isSelected={modules.exploreCompany} onChange={updateModule("exploreCompany")} />
            </div>
          }
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#d5dde2] w-full mt-2" />

      {/* Save Button */}
      <div className="flex justify-end w-full">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors"
        >
          Save changes
        </button>
      </div>
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
      className={`flex-1 bg-white border border-[#d5dde2] p-4 flex items-center justify-between -mr-px ${isFirst ? "rounded-l-lg" : ""
        } ${isLast ? "rounded-r-lg" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="bg-[#f9fafb] border border-[#d5dde2] rounded-[5.4px] p-[7px] flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#3f52ff] leading-[18px]">
            {title}
          </span>
          <span className="text-xs text-[#516778] leading-[18px]">
            {subtitle}
          </span>
        </div>
      </div>
      <span className="text-base font-semibold text-[#22292f] leading-[18px]">
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
        <span className="text-base font-semibold text-[#22292f] leading-[18px]">
          Chapter Team Members
        </span>
        <span className="text-xs font-semibold text-[#859bab] leading-[18px]">
          Add team members who will manage this chapter and receive admin
          notifications
        </span>
      </div>

      {/* Team Member Headshot */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#22292f]">
          Team Member Headshot
        </span>
        <div className="w-16 h-16 rounded-full border border-dashed border-[#d4d4d8] flex items-center justify-center cursor-pointer hover:border-[#859bab] transition-colors">
          <User className="w-4 h-4 text-[#71717b] opacity-60" />
        </div>
      </div>

      {/* Add Member Row */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#22292f]">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className="h-9 w-[180px] px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
          />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#22292f]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-9 w-[200px] px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="h-9 px-3 flex items-center gap-2 text-sm text-[#22292f] border border-[#d5dde2] rounded-lg hover:border-[#859bab] transition-colors bg-white"
            >
              {selectedRole}
              <ChevronDown className="w-3.5 h-3.5 text-[#859bab]" />
            </button>
            {showRoleDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#d5dde2] rounded-lg shadow-lg z-50 min-w-[140px]">
                {(["Chapter Lead", "Co-Lead", "Member"] as TeamRole[]).map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f5f5] transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedRole === role
                        ? "text-[#3f52ff] font-medium"
                        : "text-[#22292f]"
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
          className="h-9 px-4 bg-[#22292f] text-white text-sm font-medium rounded-lg hover:bg-[#3a4550] transition-colors whitespace-nowrap"
        >
          + Add team member
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#d5dde2] w-full" />

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
    <div className="bg-white border border-[#d5dde2] rounded-xl p-2 flex items-center justify-between max-w-[564px]">
      <div className="flex items-center gap-2">
        <div className="bg-[#d8e6ff] border border-[#8faeff] rounded-[9px] p-3 flex items-center justify-center">
          <CircleUserRound className="w-4 h-4 text-[#3f52ff]" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-base font-semibold text-[#22292f] leading-[18px]">
              {member.name}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeClass}`}
            >
              {member.role}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#859bab] leading-[18px]">
            {member.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 px-3 flex items-center gap-1.5 text-sm text-[#22292f] bg-[#f5f5f5] border border-[#d5dde2] rounded-lg hover:bg-[#eceff2] transition-colors"
          >
            {member.role}
            <ChevronDown className="w-3.5 h-3.5 text-[#859bab]" />
          </button>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#d5dde2] rounded-lg shadow-lg z-50 min-w-[140px]">
              {(["Chapter Lead", "Co-Lead", "Member"] as TeamRole[]).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f5f5] transition-colors first:rounded-t-lg last:rounded-b-lg ${member.role === role
                      ? "text-[#3f52ff] font-medium"
                      : "text-[#22292f]"
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
          className="w-7 h-7 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#516778]" />
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
    <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
          Create New Chapter
        </h1>
        <p className="text-base font-semibold text-[#859bab] leading-[18px]">
          Fill in all required fields to create a new chapter. All fields marked
          with * are mandatory.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
        {createChapterTabs.map((tab) => (
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
                layoutId="createChapterTabIndicator"
                className="absolute inset-0 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
      <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
        {/* Basic Info Tab */}
        {activeTab === "Basic Info" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-[#22292f]">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="eg. Dubai Chapter"
                  className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-[#22292f]">
                  Chapter Code *
                </label>
                <input
                  type="text"
                  value={chapterCode}
                  onChange={(e) => setChapterCode(e.target.value)}
                  placeholder="eg. CH007"
                  className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-[#22292f]">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="eg. Dubai"
                  className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-[#22292f]">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="eg. UAE"
                  className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
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
                  <label className="text-sm font-semibold text-[#22292f]">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="eg. Burj Al-Arab"
                    className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#22292f]">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="Enter the vanue full address"
                    className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#22292f]">
                    Search on map
                  </label>
                  <input
                    type="text"
                    value={searchPlace}
                    onChange={(e) => setSearchPlace(e.target.value)}
                    placeholder="Search Places (eg. Central Park, NY)"
                    className="h-9 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] border border-[#d5dde2] rounded-lg outline-none focus:border-[#3f52ff] transition-colors"
                  />
                </div>
              </div>

              {/* Right: Map Placeholder */}
              <div className="flex-1 min-h-[215px] bg-[#e8ecf0] rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-[#859bab]">
                  <MapPin className="w-8 h-8" />
                  <span className="text-sm">Map preview</span>
                </div>
              </div>
            </div>

            {/* Info Toast */}
            <div className="flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-3 py-2 max-w-fit">
              <Info className="w-4 h-4 text-[#3b82f6] shrink-0" />
              <span className="text-[13px] text-[#516778]">
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
          <div className="flex flex-col gap-4 min-h-[200px] items-center justify-center text-[#859bab]">
            <span className="text-sm">Chapter settings will appear here</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-[#22292f] text-white text-sm font-medium rounded-lg hover:bg-[#3a4550] transition-colors"
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
      <div className="relative bg-white rounded-3xl w-[562px] max-h-[90vh] overflow-y-auto shadow-xl flex flex-col gap-6 py-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#516778]" />
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors">
              <ChevronUp className="w-4 h-4 text-[#516778]" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors">
              <ChevronDown className="w-4 h-4 text-[#516778]" />
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
          <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
            Basic Information
          </span>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Chapter ID</span>
              <span className="text-base text-[#22292f] leading-[18px]">{chapter.code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Sort Order</span>
              <span className="text-base text-[#22292f] leading-[18px]">1</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Created</span>
              <span className="text-base text-[#22292f] leading-[18px]">11/28/2025</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Last Updated</span>
              <span className="text-base text-[#22292f] leading-[18px]">{chapter.lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#d5dde2] mx-4" />

        {/* Venue Information */}
        <div className="flex flex-col gap-6 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
              Venue Information
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22292f] text-white text-xs font-medium rounded-lg hover:bg-[#3a4550] transition-colors">
              View on maps
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Venue Name</span>
              <span className="text-base text-[#22292f] leading-[18px]">Manhattan Community Center</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-semibold text-[#668091] leading-[18px]">Address</span>
              <span className="text-base text-[#22292f] leading-[18px]">123 Madison Avenue, {chapter.city}, {chapter.country}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#d5dde2] mx-4" />

        {/* Chapter Story */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
            Chapter Story
          </span>
          <p className="text-sm font-semibold text-[#668091] leading-[18px]">
            The {chapter.name} Chapter brings together professionals and enthusiasts in the heart of {chapter.city}. Join us for networking events, workshops, and community building. Our vibrant community hosts monthly meetups, quarterly conferences, and annual galas that bring together industry leaders and innovators.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#d5dde2] mx-4" />

        {/* Team Members */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
            Team Members
          </span>
          <div className="flex flex-col gap-2">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="bg-white border border-[#d5dde2] rounded-xl p-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-[#d8e6ff] border border-[#8faeff] rounded-[9px] p-3 flex items-center justify-center">
                    <CircleUserRound className="w-4 h-4 text-[#3f52ff]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-[#22292f] leading-[18px]">
                      {member.name}
                    </span>
                    <span className="text-xs font-semibold text-[#859bab] leading-[18px]">
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
        <div className="h-px bg-[#d5dde2] mx-4" />

        {/* Notifications Default */}
        <div className="flex flex-col gap-6 px-4">
          <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
            Notifications Default
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#22292f]">Enable Notifications</span>
              <AriaSwitch
                isSelected={notifications.enableNotifications}
                onChange={() => toggleNotification("enableNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#22292f]">Auto-Notify New Events</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewEvents}
                onChange={() => toggleNotification("autoNotifyNewEvents")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#22292f]">Auto-Notify New Updates</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyNewUpdates}
                onChange={() => toggleNotification("autoNotifyNewUpdates")}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#22292f]">Auto-Notify Announcements</span>
              <AriaSwitch
                isSelected={notifications.autoNotifyAnnouncements}
                onChange={() => toggleNotification("autoNotifyAnnouncements")}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#d5dde2] mx-4" />

        {/* Linked Events */}
        <div className="flex flex-col gap-6 px-4 pb-2">
          <span className="text-xl font-semibold text-[#22292f] leading-[18px]">
            Linked Events
          </span>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#22292f] leading-[18px]">
                {eventCount} Events linked to this chapter
              </span>
              <span className="text-sm text-[#668091] leading-[18px]">
                Events use this chapter for filtering and mobile display
              </span>
            </div>
            <button className="px-3 py-1.5 bg-[#22292f] text-white text-xs font-medium rounded-lg hover:bg-[#3a4550] transition-colors">
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
      <MenuButton className="p-1 hover:bg-[#f5f5f5] rounded transition-colors focus:outline-none">
        <MoreVertical className="w-4 h-4 text-[#859bab]" />
      </MenuButton>

      <Portal>
        <MenuItems
          anchor="bottom end"
          transition
          className="z-[100] mt-1 bg-white border border-[#d5dde2] rounded-lg shadow-lg min-w-[120px] py-1 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
        >
          <MenuItem>
            <button
              onClick={onView}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#22292f] data-[focus]:bg-[#f5f5f5] hover:bg-[#f5f5f5] transition-colors focus:outline-none"
            >
              <Eye className="w-4 h-4 text-[#859bab]" />
              View
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#22292f] data-[focus]:bg-[#f5f5f5] hover:bg-[#f5f5f5] transition-colors focus:outline-none"
            >
              <Pencil className="w-4 h-4 text-[#859bab]" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#E22023] data-[focus]:bg-red-50 hover:bg-red-50 transition-colors focus:outline-none"
            >
              <Trash2 className="w-4 h-4 text-[#E22023]" />
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
      <div className="bg-[#eceff2] border border-[#d5dde2] rounded-lg pt-4 pb-2 px-2 flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 px-2">
          <h1 className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
            Chapters Management
          </h1>
          <p className="text-base font-semibold text-[#859bab] leading-[18px]">
            Create and manage chapters for event segmentation and storytelling
          </p>
        </div>

        {/* Stat Cards Row */}
        <div className="flex">
          <StatCard
            icon={<Tags className="w-4 h-4 text-[#516778]" />}
            title="Total Chapters"
            subtitle="All chapters in organization"
            value={3}
            isFirst
          />
          <StatCard
            icon={<Tag className="w-4 h-4 text-[#516778]" />}
            title="Active Chapters"
            subtitle="Currently operational"
            value={3}
          />
          <StatCard
            icon={<Eye className="w-4 h-4 text-[#516778]" />}
            title="Visible in App"
            subtitle="Shown to mobile users"
            value={2}
          />
          <StatCard
            icon={<Link2 className="w-4 h-4 text-[#516778]" />}
            title="Linked Events"
            subtitle="Total events across chapters"
            value={20}
            isLast
          />
        </div>

        {/* White Card - Table Section */}
        <div className="bg-white border border-[#d5dde2] rounded-lg p-4 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#22292f] leading-[18px]">
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
          <div className="flex items-center gap-2 h-9 px-3 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors max-w-md">
            <Search className="w-4 h-4 text-[#859bab] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chapter name, city or country"
              className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
            />
            <kbd className="text-xs text-[#859bab] bg-[#eceff2] px-1.5 py-0.5 rounded border border-[#d5dde2]">
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
                <tr className="[&>th]:bg-[#eceff2] [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="h-9 px-3 py-2 text-left text-sm font-medium text-[#22292f]"
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {header !== "Action" && (
                          <ChevronsUpDown className="w-3.5 h-3.5 text-[#859bab]" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chaptersData.map((chapter) => (
                  <tr
                    key={chapter.code}
                    className="border-b border-[#eceff2] last:border-b-0"
                  >
                    {/* Chapter */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#22292f]">
                          {chapter.name}
                        </span>
                        <span className="text-xs text-[#859bab]">
                          {chapter.code}
                        </span>
                      </div>
                    </td>
                    {/* Location */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#22292f]">
                          {chapter.city}
                        </span>
                        <span className="text-xs text-[#859bab]">
                          {chapter.country}
                        </span>
                      </div>
                    </td>
                    {/* Team */}
                    <td className="px-3 py-3 text-sm text-[#22292f]">
                      {chapter.team}
                    </td>
                    {/* Events */}
                    <td className="px-3 py-3 text-sm text-[#22292f]">
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
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#22892e] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {chapter.status}
                      </span>
                    </td>
                    {/* Last Update */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#22292f]">
                          {chapter.lastUpdate}
                        </span>
                        {chapter.updatedBy && (
                          <span className="text-xs text-[#859bab]">
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
          <div className="relative bg-white border border-[#d5dde2] rounded-xl w-[420px] flex flex-col gap-4 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-[#d5dde2]">
              <div className="flex items-center gap-4">
                <div className="bg-[#ffe0e1] rounded-md p-2">
                  <AlertCircle className="w-4 h-4 text-[#e53935]" />
                </div>
                <span className="text-base font-semibold text-[#22292f]">
                  Delete Chapter
                </span>
              </div>
              <button
                onClick={() => setDeleteChapter(null)}
                className="w-7 h-7 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#516778]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-4">
              <p className="text-sm font-semibold text-[#859bab] leading-[20px]">
                <span className="font-bold text-[#22292f]">
                  &quot;{deleteChapter.name} Chapter&quot;
                </span>{" "}
                has {getEventCount(deleteChapter.events)} linked events. Deleting
                this chapter will remove the chapter reference from those events.
                Are you sure you want to continue?
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-[#d5dde2]">
              <button
                onClick={() => setDeleteChapter(null)}
                className="flex-1 h-10 px-4 text-sm font-medium text-[#22292f] bg-white border border-[#d5dde2] rounded-lg hover:bg-[#f5f5f5] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => setDeleteChapter(null)}
                className="flex-1 h-10 px-4 text-sm font-medium text-white bg-[#e53935] rounded-lg hover:bg-[#c62828] transition-colors"
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
