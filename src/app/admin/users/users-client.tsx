"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import {
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronsUpDown,
  Search,
  MoreVertical,
  CircleUserRound,
  Mail,
  X,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AriaCheckbox } from "@/components/ui/aria-checkbox";
import { AriaSelect, AriaSelectItem } from "@/components/ui/aria-select";
import { toastQueue } from "@/components/ui/aria-toast";
import AdminSidebar from "@/components/admin-sidebar";
import { AriaSwitch } from "@/components/ui/aria-switch";

const COUNTRY_OPTIONS = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czechia",
  "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman",
  "Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar",
  "Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam",
  "Yemen",
  "Zambia","Zimbabwe"
];

const NATIONALITY_OPTIONS = [
  "Afghan","Albanian","Algerian","Andorran","Angolan","Antiguan or Barbudan","Argentine","Armenian","Australian","Austrian","Azerbaijani",
  "Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian or Herzegovinian","Botswanan","Brazilian","Bruneian","Bulgarian","Burkinabe","Burundian",
  "Cabo Verdean","Cambodian","Cameroonian","Canadian","Central African","Chadian","Chilean","Chinese","Colombian","Comoran","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech",
  "Congolese (DRC)","Danish","Djiboutian","Dominican","Dominican (Republic)",
  "Ecuadorian","Egyptian","Salvadoran","Equatorial Guinean","Eritrean","Estonian","Swazi","Ethiopian",
  "Fijian","Finnish","French",
  "Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Bissau-Guinean","Guyanese",
  "Haitian","Honduran","Hungarian",
  "Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian",
  "Jamaican","Japanese","Jordanian",
  "Kazakh","Kenyan","I-Kiribati","Kuwaiti","Kyrgyz",
  "Lao","Latvian","Lebanese","Basotho","Liberian","Libyan","Liechtensteiner","Lithuanian","Luxembourgish",
  "Malagasy","Malawian","Malaysian","Maldivian","Malian","Maltese","Marshallese","Mauritanian","Mauritian","Mexican","Micronesian","Moldovan","Monégasque","Mongolian","Montenegrin","Moroccan","Mozambican","Burmese",
  "Namibian","Nauruan","Nepali","Dutch","New Zealander","Nicaraguan","Nigerien","Nigerian","North Korean","Macedonian","Norwegian",
  "Omani",
  "Pakistani","Palauan","Panamanian","Papua New Guinean","Paraguayan","Peruvian","Filipino","Polish","Portuguese",
  "Qatari",
  "Romanian","Russian","Rwandan",
  "Kittitian or Nevisian","Saint Lucian","Saint Vincentian","Samoan","San Marinese","Sao Tomean","Saudi","Senegalese","Serbian","Seychellois","Sierra Leonean","Singaporean","Slovak","Slovene","Solomon Islander","Somali","South African","South Korean","South Sudanese","Spanish","Sri Lankan","Sudanese","Surinamese","Swedish","Swiss","Syrian",
  "Taiwanese","Tajik","Tanzanian","Thai","Timorese","Togolese","Tongan","Trinidadian or Tobagonian","Tunisian","Turkish","Turkmen","Tuvaluan",
  "Ugandan","Ukrainian","Emirati","British","American","Uruguayan","Uzbek",
  "Vanuatuan","Vatican","Venezuelan","Vietnamese",
  "Yemeni",
  "Zambian","Zimbabwean"
];

// --- Types ---
export type UserStatus = "Active" | "Inactive";
export type ProfileStatus = "Verified" | "Not Verified" | "Completed" | "Active";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  status: UserStatus | null;
  profile_status: ProfileStatus | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  country: string | null;
  nationality: string | null;
  profile_visible?: boolean;
  directory_fields?: string[];
  created_at: string | null;
}

interface UsersPageClientProps {
  users: UserProfile[];
  currentUser: {
    email: string | undefined;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// --- Sub-components ---

function StatusBadge({ status }: { status: UserStatus | null }) {
  const isActive = status === "Active";
  return (
    <div className="inline-flex items-center gap-2 bg-white border border-[#e4e4e4] rounded-full px-3 py-1">
      {isActive ? (
        <CheckCircle2 className="w-[18px] h-[18px] text-[#22c55e] fill-[#22c55e] stroke-white" />
      ) : (
        <XCircle className="w-[18px] h-[18px] text-[#ef4444] fill-[#ef4444] stroke-white" />
      )}
      <span className="text-sm font-medium text-[#1f232c] leading-[18px]">{status || "Unknown"}</span>
    </div>
  );
}

function ProfileStatusBadge({ status }: { status: ProfileStatus | null }) {
  const config: Record<ProfileStatus, { bg: string; text: string; border: string; dot: string }> = {
    Verified: { bg: "bg-[#f0fdf4]", text: "text-[#16a34a]", border: "border-[#bbf7d0]", dot: "bg-[#22c55e]" },
    "Not Verified": { bg: "bg-[#fef2f2]", text: "text-[#e16767]", border: "border-[#fecaca]", dot: "bg-[#e16767]" },
    Completed: { bg: "bg-[#ffebcc]", text: "text-[#fe9a00]", border: "border-[#fdd889]", dot: "bg-[#fe9a00]" },
    Active: { bg: "bg-[#f0fdf4]", text: "text-[#16a34a]", border: "border-[#bbf7d0]", dot: "bg-[#22c55e]" },
  };
  const c = config[status || "Not Verified"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status || "Not Verified"}
    </span>
  );
}

function ActionMenu({
  onViewActivity,
  onEdit,
  onDelete,
}: {
  onViewActivity: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu>
      <MenuButton className="p-1.5 rounded-lg hover:bg-[#eceff2] transition-colors focus:outline-none">
        <MoreVertical className="w-4 h-4 text-[#516778]" />
      </MenuButton>

      <Portal>
        <MenuItems
          anchor="bottom end"
          transition
          className="z-[100] mt-1 bg-[#f9fafb] border border-[#d5dde2] rounded-xl p-1 shadow-lg w-[165px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
        >
          <MenuItem>
            <button
              onClick={onViewActivity}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-[#d8e6ff] hover:bg-[#d8e6ff] transition-colors text-[#22292f] group focus:outline-none"
            >
              <Eye className="w-4 h-4" />
              View Activity
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-[#d8e6ff] hover:bg-[#d8e6ff] transition-colors text-[#22292f] focus:outline-none"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-red-50 hover:bg-red-50 transition-colors text-[#E22023] focus:outline-none"
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

// --- Delete User Confirmation Modal ---
function DeleteUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete user");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

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
              Delete User
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
              &quot;{user.full_name || "this user"}&quot;
            </span>
            ? This action cannot be undone and will permanently remove the user
            account and all associated data.
          </p>
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
        {/* Modal Footer */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-[#d5dde2]">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 px-4 text-sm font-medium text-[#22292f] bg-white border border-[#d5dde2] rounded-lg hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-[#e53935] rounded-lg hover:bg-[#c62828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Edit User View (inline page) ---
function EditUserView({
  user,
  onClose,
  onSuccess,
}: {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const nameParts = (user.full_name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const [country, setCountry] = useState(user.country || "");
  const [nationality, setNationality] = useState(user.nationality || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role || "Member");
  const [copied, setCopied] = useState(false);
  const [userActivation, setUserActivation] = useState(user.status === "Active");
  const [profileVisible, setProfileVisible] = useState(
    user.profile_visible === undefined ? true : Boolean(user.profile_visible)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directoryFields = user.directory_fields && user.directory_fields.length > 0
    ? user.directory_fields
    : [
        "Full Name",
        "Profile Picture",
        "Email",
        "Phone Number",
        "Socials",
        "Industry",
        "Company",
        "Role",
        "Nationality",
        "Country of Residence",
        "About me section",
      ];
  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>(() => {
    const initial = Object.fromEntries(directoryFields.map((f) => [f, true]));
    if (user.directory_fields && Array.isArray(user.directory_fields)) {
      directoryFields.forEach((f) => {
        initial[f] = user.directory_fields?.includes(f) ?? false;
      });
    }
    return initial;
  });

  const toggleField = (field: string) => {
    setCheckedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toastQueue.add({ title: "Password copied to clipboard", type: "success" }, { timeout: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  // Password strength
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passedChecks = [hasMinLength, hasNumber, hasLowercase, hasUppercase].filter(Boolean).length;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const directory_fields = Object.keys(checkedFields).filter((key) => checkedFields[key]);
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          full_name: `${firstName} ${lastName}`.trim(),
          role,
          status: userActivation ? "Active" : "Inactive",
          phone,
          gender,
          country,
          nationality,
          profile_visible: profileVisible,
          directory_fields,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        setLoading(false);
        return;
      }
      onSuccess();
      toastQueue.add({
        title: "User Updated",
        description: `${firstName} ${lastName}'s profile has been updated successfully.`,
        type: "success"
      });
    } catch {
      setError("Network error. Please try again.");
      toastQueue.add({
        title: "Save Failed",
        description: "Network error. Please try again.",
        type: "error"
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      {/* Edit Header Bar */}
      <div className="bg-[#edf8ff] rounded-xl flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#d8e6ff] flex items-center justify-center hover:bg-[#c4d8fc] transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#3f52ff]" />
          </button>
          <span className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
            Edit
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Separator */}
      <div className="h-px bg-[#eceff2]" />

      {/* Form Card */}
      <div className="bg-white border border-[#d5dde2] rounded-xl p-3 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* Row 1: First Name + Last Name */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Kobe"
                className="h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff] transition-colors"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Paras"
                className="h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Phone Number + Gender */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Phone Number</label>
              <div className="flex h-9 bg-white border border-[#b0bfc9] rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 shrink-0">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-sm font-semibold text-[#22292f]">+971</span>
                  <ChevronDown className="w-4 h-4 text-[#859bab]" />
                </div>
                <div className="w-px bg-[#d1d1d1]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="flex-1 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Gender</label>
              <AriaSelect
                aria-label="Gender"
                selectedKey={gender || undefined}
                onSelectionChange={(key) => setGender(key as string)}
                placeholder="Select"
              >
                <AriaSelectItem id="Male" textValue="Male">Male</AriaSelectItem>
                <AriaSelectItem id="Female" textValue="Female">Female</AriaSelectItem>
                <AriaSelectItem id="Other" textValue="Other">Other</AriaSelectItem>
              </AriaSelect>
            </div>
          </div>

          {/* Row 3: Country + Nationality */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Country</label>
              <AriaSelect
                aria-label="Country"
                selectedKey={country || undefined}
                onSelectionChange={(key) => setCountry(key as string)}
                placeholder="Select"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <AriaSelectItem key={c} id={c} textValue={c}>
                    {c}
                  </AriaSelectItem>
                ))}
              </AriaSelect>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Nationality</label>
              <AriaSelect
                aria-label="Nationality"
                selectedKey={nationality || undefined}
                onSelectionChange={(key) => setNationality(key as string)}
                placeholder="Select"
              >
                {NATIONALITY_OPTIONS.map((n) => (
                  <AriaSelectItem key={n} id={n} textValue={n}>
                    {n}
                  </AriaSelectItem>
                ))}
              </AriaSelect>
            </div>
          </div>

          {/* Row 4: Email + Password + Re-generate */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Email</label>
              <div className="flex items-center h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg gap-2">
                <Mail className="w-4 h-4 text-[#859bab] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yybouhamed@gmail.com"
                  className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Password</label>
              <div className="flex gap-4 items-start">
                <div className="flex items-center h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg gap-2 flex-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                  />
                  <button
                    onClick={copyPassword}
                    className="shrink-0 p-0.5 hover:bg-[#f5f5f5] rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#22c55e]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#859bab]" />
                    )}
                  </button>
                </div>
                <button
                  onClick={generatePassword}
                  className="h-9 px-3 bg-[#22292f] text-white text-sm font-medium rounded-lg hover:bg-[#3a4550] transition-colors shrink-0"
                >
                  Re-generate
                </button>
              </div>
              {/* Strength Meter */}
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full ${i < passedChecks ? "bg-[#22c55e]" : "bg-[#d5dde2]"
                      }`}
                  />
                ))}
              </div>
              {/* Strength Checklist */}
              <div className="flex flex-col gap-1">
                {[
                  { label: "At least 8 characters", passed: hasMinLength },
                  { label: "At least 1 number", passed: hasNumber },
                  { label: "At least 1 lowercase letter", passed: hasLowercase },
                  { label: "At least 1 uppercase letter", passed: hasUppercase },
                ].map((check) => (
                  <div key={check.label} className="flex items-center gap-1.5">
                    <Check
                      className={`w-3.5 h-3.5 ${check.passed ? "text-[#22c55e]" : "text-[#d5dde2]"
                        }`}
                    />
                    <span
                      className={`text-xs ${check.passed ? "text-[#22c55e]" : "text-[#859bab]"
                        }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Role */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Role</label>
              <AriaSelect
                aria-label="Role"
                selectedKey={role || undefined}
                onSelectionChange={(key) => setRole(key as string)}
                placeholder="Select role"
              >
                <AriaSelectItem id="Organization Admin" textValue="Organization Admin">Organization Admin</AriaSelectItem>
                <AriaSelectItem id="Chapter Lead" textValue="Chapter Lead">Chapter Lead</AriaSelectItem>
                <AriaSelectItem id="Co-Lead" textValue="Co-Lead">Co-Lead</AriaSelectItem>
                <AriaSelectItem id="Member" textValue="Member">Member</AriaSelectItem>
              </AriaSelect>
            </div>
            <div className="flex-1" />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#d5dde2]" />

        {/* User Activation */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[#22292f]">User Activation</span>
            <span className="text-xs font-semibold text-[#859bab]">
              Control whether this user account is active or inactive.
            </span>
          </div>
          <AriaSwitch isSelected={userActivation} onChange={setUserActivation} />
        </div>

        {/* Profile Directory Visibility */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#22292f]">
                Profile to be viewed in member directory section
              </span>
              <span className="text-xs font-semibold text-[#859bab]">
                Control whether this user account is active or inactive.
              </span>
            </div>
            <AriaSwitch isSelected={profileVisible} onChange={setProfileVisible} />
          </div>

          {/* Checkboxes */}
          {profileVisible && (
            <div className="bg-[#eceff2] rounded-lg p-2 flex flex-col gap-2">
              {directoryFields.map((field) => (
                <AriaCheckbox
                  key={field}
                  isSelected={checkedFields[field]}
                  onChange={() => toggleField(field)}
                >
                  <span className="font-medium text-[#22292f]">{field}</span>
                </AriaCheckbox>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="h-8 px-4 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}

// --- View Activity View (inline page) ---
interface ActivityItem {
  id: string;
  userName: string;
  avatarUrl: string | null;
  action: string;
  highlight?: string;
  timeAgo: string;
  badge?: { label: string; type: "completed" | "pending" };
  avatarGroup?: { avatars: string[]; extra: number };
  file?: { name: string };
}

function ViewActivityView({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) {
  // Mock activity data for now — this would come from an API in production
  const activities: ActivityItem[] = [
    {
      id: "1",
      userName: user.full_name || "User",
      avatarUrl: user.avatar_url,
      action: "updated permissions for user management",
      timeAgo: "3 min ago",
    },
    {
      id: "2",
      userName: user.full_name || "User",
      avatarUrl: user.avatar_url,
      action: "uploaded",
      highlight: "video-script.pdf",
      timeAgo: "2 hour ago",
      badge: { label: "Completed", type: "completed" },
    },
    {
      id: "3",
      userName: user.full_name || "User",
      avatarUrl: user.avatar_url,
      action: "uploaded",
      highlight: "video-script.pdf",
      timeAgo: "9 hours ago",
      avatarGroup: {
        avatars: ["/img/unitee-logo.png", "/img/unitee-logo.png", "/img/unitee-logo.png", "/img/unitee-logo.png", "/img/unitee-logo.png"],
        extra: 2,
      },
    },
    {
      id: "4",
      userName: user.full_name || "User",
      avatarUrl: user.avatar_url,
      action: "uploaded",
      highlight: "video-script.pdf",
      timeAgo: "2 days ago",
      file: { name: "video-script.pdf" },
    },
  ];

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      {/* View Activity Header Bar */}
      <div className="bg-[#edf8ff] rounded-xl flex items-center gap-2 p-2">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[#d8e6ff] flex items-center justify-center hover:bg-[#c4d8fc] transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-[#3f52ff]" />
        </button>
        <span className="text-xl font-semibold text-[#3f52ff] leading-[18px]">
          View Activity
        </span>
      </div>

      {/* Activity Feed Card */}
      <div className="bg-white border border-[#d5dde2] rounded-lg pt-3 px-3 flex flex-col">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start justify-between py-3">
              {/* Left: Avatar + Content */}
              <div className="flex gap-2 items-start">
                <Image
                  src={activity.avatarUrl || "/img/unitee-logo.png"}
                  alt={activity.userName}
                  width={32}
                  height={32}
                  className="rounded-[11px] object-cover shrink-0"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-base font-medium text-[#22292f]">
                    {activity.userName}{" "}
                    <span className="text-[#859bab]">{activity.action}</span>
                    {activity.highlight && (
                      <span className="text-[#22292f]"> {activity.highlight}</span>
                    )}
                  </p>

                  {/* Badge: Completed */}
                  {activity.badge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#d1d1d1] rounded-md w-fit">
                      <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                      <span className="text-sm font-medium text-[#859bab]">
                        {activity.badge.label}
                      </span>
                    </div>
                  )}

                  {/* Avatar group */}
                  {activity.avatarGroup && (
                    <div className="inline-flex items-center gap-[9px] border border-[#d5dde2] rounded-full px-2 py-1.5 w-fit">
                      <div className="flex items-center">
                        {activity.avatarGroup.avatars.map((av, i) => (
                          <Image
                            key={i}
                            src={av}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-[11px] border-2 border-white object-cover -ml-1 first:ml-0"
                          />
                        ))}
                      </div>
                      <span className="text-[13px] font-normal text-[#22292f]">
                        +{activity.avatarGroup.extra}
                      </span>
                    </div>
                  )}

                  {/* File attachment */}
                  {activity.file && (
                    <div className="inline-flex items-center gap-6 px-4 py-1 border border-[#d1d1d1] rounded-md w-fit">
                      <div className="flex items-center gap-2">
                        <FileText className="w-[10px] h-[12.5px] text-[#859bab]" />
                        <span className="text-sm font-medium text-[#859bab]">
                          {activity.file.name}
                        </span>
                      </div>
                      <Download className="w-[8.75px] h-[11.25px] text-[#859bab]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Timestamp + Menu */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-medium text-[#859bab]">
                  {activity.timeAgo}
                </span>
                <button className="text-[#859bab] text-[15px] font-medium leading-[18px] rotate-90 -scale-y-100">
                  ...
                </button>
              </div>
            </div>

            {/* Separator between items */}
            {index < activities.length - 1 && (
              <div className="h-px bg-[#eceff2]" />
            )}
          </div>
        ))}

        {/* Bottom separator */}
        <div className="h-px bg-[#d5dde2]" />
      </div>
    </div>
  );
}

// --- Add User Modal ---
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [nationality, setNationality] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toastQueue.add({ title: "Password copied to clipboard", type: "success" }, { timeout: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate required fields
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          gender,
          country,
          nationality,
          role: role || "Member",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const strengthChecks = [hasMinLength, hasNumber, hasLowercase, hasUppercase];
  const passedChecks = strengthChecks.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border border-[#d5dde2] rounded-xl w-[800px] max-h-[90vh] overflow-y-auto flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-[#d5dde2]">
          <div className="flex items-center gap-4">
            <div className="bg-[#3f52ff] border-[3px] border-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_0_1px_#3f52ff]" data-node-id="2868:13090">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17.0004C21 15.7702 19.7659 14.7129 18 14.25M3 17.0004C3 15.7702 4.2341 14.7129 6 14.25M18 10.2361C18.6137 9.68679 19 8.8885 19 8C19 6.34315 17.6569 5 16 5C15.2316 5 14.5308 5.28885 14 5.76389M6 10.2361C5.38625 9.68679 5 8.8885 5 8C5 6.34315 6.34315 5 8 5C8.76835 5 9.46924 5.28885 10 5.76389M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-[#22292f] leading-[25px]">
                Add User
              </span>
              <span className="text-sm font-medium text-[#668091] leading-[18px]">
                Add users to your organisation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#eceff2] flex items-center justify-center hover:bg-[#d5dde2] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#516778]" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4 px-4 py-4">
          {/* Row 1: First Name + Last Name */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Kobe"
                className="h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff] transition-colors"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Paras"
                className="h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg text-sm text-[#22292f] placeholder:text-[#859bab] outline-none focus:border-[#3f52ff] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Phone Number + Gender */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Phone Number</label>
              <div className="flex h-9 bg-white border border-[#b0bfc9] rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 shrink-0">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-sm font-semibold text-[#22292f]">+971</span>
                  <ChevronDown className="w-4 h-4 text-[#859bab]" />
                </div>
                <div className="w-px bg-[#d1d1d1]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="flex-1 px-3 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Gender</label>
              <AriaSelect
                aria-label="Gender"
                selectedKey={gender || undefined}
                onSelectionChange={(key) => setGender(key as string)}
                placeholder="Select"
              >
                <AriaSelectItem id="Male" textValue="Male">Male</AriaSelectItem>
                <AriaSelectItem id="Female" textValue="Female">Female</AriaSelectItem>
                <AriaSelectItem id="Other" textValue="Other">Other</AriaSelectItem>
              </AriaSelect>
            </div>
          </div>

          {/* Row 3: Country + Nationality */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Country</label>
              <AriaSelect
                aria-label="Country"
                selectedKey={country || undefined}
                onSelectionChange={(key) => setCountry(key as string)}
                placeholder="Select"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <AriaSelectItem key={c} id={c} textValue={c}>
                    {c}
                  </AriaSelectItem>
                ))}
              </AriaSelect>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Nationality</label>
              <AriaSelect
                aria-label="Nationality"
                selectedKey={nationality || undefined}
                onSelectionChange={(key) => setNationality(key as string)}
                placeholder="Select"
              >
                {NATIONALITY_OPTIONS.map((n) => (
                  <AriaSelectItem key={n} id={n} textValue={n}>
                    {n}
                  </AriaSelectItem>
                ))}
              </AriaSelect>
            </div>
          </div>

          {/* Row 4: Email + Password (with Re-generate) */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Email</label>
              <div className="flex items-center h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg gap-2">
                <Mail className="w-4 h-4 text-[#859bab] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yybouhamed@gmail.com"
                  className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Password</label>
              <div className="flex gap-4 items-start">
                <div className="flex items-center h-9 px-3 bg-white border border-[#b0bfc9] rounded-lg gap-2 flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="flex-1 text-sm text-[#22292f] placeholder:text-[#859bab] outline-none bg-transparent"
                  />
                  <button
                    onClick={copyPassword}
                    className="shrink-0 p-0.5 hover:bg-[#f5f5f5] rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#22c55e]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#859bab]" />
                    )}
                  </button>
                </div>
                <button
                  onClick={generatePassword}
                  className="h-9 px-3 bg-[#22292f] text-white text-sm font-medium rounded-lg hover:bg-[#3a4550] transition-colors shrink-0"
                >
                  Re-generate
                </button>
              </div>
              {/* Strength Meter */}
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full ${i < passedChecks ? "bg-[#22c55e]" : "bg-[#d5dde2]"
                      }`}
                  />
                ))}
              </div>
              {/* Strength Checklist */}
              <div className="flex flex-col gap-1">
                {[
                  { label: "At least 8 characters", passed: hasMinLength },
                  { label: "At least 1 number", passed: hasNumber },
                  { label: "At least 1 lowercase letter", passed: hasLowercase },
                  { label: "At least 1 uppercase letter", passed: hasUppercase },
                ].map((check) => (
                  <div key={check.label} className="flex items-center gap-1.5">
                    <Check
                      className={`w-3.5 h-3.5 ${check.passed ? "text-[#22c55e]" : "text-[#d5dde2]"
                        }`}
                    />
                    <span
                      className={`text-xs ${check.passed ? "text-[#22c55e]" : "text-[#859bab]"
                        }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Role */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#22292f]">Role</label>
              <AriaSelect
                aria-label="Role"
                selectedKey={role || undefined}
                onSelectionChange={(key) => setRole(key as string)}
                placeholder="Select role"
              >
                <AriaSelectItem id="Organization Admin" textValue="Organization Admin">Organization Admin</AriaSelectItem>
                <AriaSelectItem id="Chapter Lead" textValue="Chapter Lead">Chapter Lead</AriaSelectItem>
                <AriaSelectItem id="Co-Lead" textValue="Co-Lead">Co-Lead</AriaSelectItem>
                <AriaSelectItem id="Member" textValue="Member">Member</AriaSelectItem>
              </AriaSelect>
            </div>
            <div className="flex-1" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-[#d5dde2]">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium text-[#22292f] underline underline-offset-2 hover:text-[#516778] transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-6 bg-[#3f52ff] text-white text-sm font-medium rounded-lg hover:bg-[#3545e0] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Client Component ---
export default function UsersPageClient({ users, currentUser }: UsersPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [viewActivityUser, setViewActivityUser] = useState<UserProfile | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleMutationSuccess = () => {
    setShowAddUser(false);
    setDeleteUser(null);
    setEditUser(null);
    setViewActivityUser(null);
    setSelectedUserIds(new Set());
    router.refresh(); // Re-fetches server component data
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedUserIds).map((id) =>
        fetch(`/api/users?id=${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      handleMutationSuccess();
    } catch {
      // silently fail individual errors
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const selected = users.filter((u) => selectedUserIds.has(u.id));
    const headers = ["Full Name", "Email", "Role", "Status", "Profile Status", "Registration Date"];
    const rows = selected.map((u) => [
      u.full_name || "",
      u.email || "",
      u.role || "",
      u.status || "",
      u.profile_status || "",
      u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "active" && u.status !== "Active") return false;
    if (activeTab === "inactive" && u.status !== "Inactive") return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !u.full_name?.toLowerCase().includes(query) &&
        !u.email?.toLowerCase().includes(query) &&
        !u.role?.toLowerCase().includes(query)
      ) return false;
    }
    return true;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#f9fafb] font-[family-name:'Instrument_Sans',sans-serif]">
        <AdminSidebar currentUser={currentUser} />

        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-[#eceff2]">
            <nav className="flex items-center gap-0.5 text-sm">
              <span className="text-[#859bab] font-medium px-1 py-0.5">
                <CircleUserRound className="w-4 h-4 inline mr-1" />
              </span>
              {editUser || viewActivityUser ? (
                <>
                  <button
                    onClick={() => { setEditUser(null); setViewActivityUser(null); }}
                    className="text-[#859bab] font-medium px-1 py-0.5 hover:text-[#516778] transition-colors"
                  >
                    Users Account Management
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#859bab]" />
                  <span className="text-[#22292f] font-medium px-1 py-0.5">
                    {editUser ? "Edit" : "View Activity"}
                  </span>
                </>
              ) : (
                <span className="text-[#859bab] font-medium px-1 py-0.5">Users Account Management</span>
              )}
            </nav>
            <div className="bg-[#d5dde2] rounded-full p-[7px] relative">
              <Bell className="w-[17px] h-[17px] text-[#22292f]" />
              {(editUser || viewActivityUser) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3f52ff] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {editUser ? (
              <EditUserView
                user={editUser}
                onClose={() => setEditUser(null)}
                onSuccess={handleMutationSuccess}
              />
            ) : viewActivityUser ? (
              <ViewActivityView
                user={viewActivityUser}
                onClose={() => setViewActivityUser(null)}
              />
            ) : (
              <div className="px-10 py-6">
                {/* Page header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-lg font-semibold text-[#3f52ff]">Users Account Management</h1>
                    <p className="text-sm text-[#668091] mt-1">
                      This section enables you to manage your app members and Teams
                    </p>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-[#d5dde2] rounded-lg text-sm font-medium text-[#22292f] bg-white hover:bg-gray-50">
                    Members
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 border border-[#d5dde2] rounded-xl mb-6 bg-white">
                  {[
                    { label: "Total Users", sub: "All registered users", value: totalUsers, color: "text-[#3f52ff]", Icon: Users },
                    { label: "Active Users", sub: totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}% of total` : "0%", value: activeUsers, color: "text-[#3f52ff]", Icon: Users },
                    { label: "Inactive Users", sub: totalUsers > 0 ? `${((inactiveUsers / totalUsers) * 100).toFixed(1)}% of total` : "0%", value: inactiveUsers, color: "text-[#3f52ff]", Icon: Users },
                  ].map((card, i) => (
                    <div
                      key={card.label}
                      className={`flex items-center justify-between px-4 py-4 ${i < 2 ? "border-r border-[#d5dde2]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#eef1ff] flex items-center justify-center">
                          <card.Icon className="w-4 h-4 text-[#3f52ff]" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${card.color}`}>{card.label}</p>
                          <p className="text-xs text-[#859bab]">{card.sub}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-[#22292f]">{card.value}</span>
                    </div>
                  ))}
                </div>

                {/* Search + Filter + Add User */}
                <div className="bg-white border border-[#d5dde2] rounded-xl">
                  <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg w-[373px]">
                        <Search className="w-4 h-4 text-[#668091]" />
                        <input
                          type="text"
                          placeholder="Search Users"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] bg-transparent outline-none border-none p-0 focus:ring-0"
                        />
                        <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded">⌘K</span>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-[#3f52ff] text-white rounded-lg text-sm font-medium hover:bg-[#3545e0] transition-colors">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUserIds.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          disabled={bulkDeleting}
                          className="flex items-center gap-1.5 h-8 px-3 bg-[#ffe0e1] text-[#e53935] rounded-lg text-sm font-medium hover:bg-[#fcc] transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="bg-[#e53935] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {selectedUserIds.size}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={handleExportCSV}
                        disabled={selectedUserIds.size === 0}
                        className={`flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg transition-colors ${selectedUserIds.size > 0
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
                        {selectedUserIds.size > 0 && (
                          <span className="bg-white text-[#22292f] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {selectedUserIds.size}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowAddUser(true)}
                        className="flex items-center gap-1 h-8 px-3 bg-[#3f52ff] text-white rounded-lg text-sm font-medium hover:bg-[#3545e0] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add User
                      </button>
                    </div>
                  </div>

                  {/* Tabs - Design System Tablist with Framer Motion */}
                  <div className="px-4 py-3">
                    <div className="inline-flex items-center bg-[#eceff2] rounded-lg p-1 relative">
                      {(["all", "active", "inactive"] as const).map((tab) => (
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
                              layoutId="activeTabIndicator"
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
                            {tab === "all" ? "All users" : tab === "active" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table - Design System */}
                  <div className="overflow-x-auto px-4">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-12" />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col className="w-20" />
                      </colgroup>
                      {/* Table Header */}
                      <thead>
                        <tr className="[&>th]:bg-[#eceff2]">
                          <th className="h-9 px-3 py-2 text-left rounded-l-lg">
                            <AriaCheckbox
                              isSelected={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
                              isIndeterminate={selectedUserIds.size > 0 && selectedUserIds.size < filteredUsers.length}
                              onChange={() => toggleSelectAll()}
                            />
                          </th>
                          {["Full Name", "Role", "Registration Date", "Status", "Profile Status", "Action"].map((h, i, arr) => (
                            <th
                              key={h}
                              className={`h-9 px-3 py-2 text-left ${i === arr.length - 1 ? "rounded-r-lg" : ""}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-[#22292f] leading-5 whitespace-nowrap">
                                  {h}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-[#859bab] shrink-0" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {/* Table Body */}
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-8 text-center text-[#859bab] text-sm">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              className={`bg-white hover:bg-[#f9fafb] transition-colors ${index < filteredUsers.length - 1 ? "border-b border-[#eceff2]" : ""
                                }`}
                            >
                              <td className="h-[46px] px-3 py-2">
                                <AriaCheckbox
                                  isSelected={selectedUserIds.has(user.id)}
                                  onChange={() => toggleUserSelection(user.id)}
                                />
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={user.avatar_url || "/img/unitee-logo.png"}
                                    alt={user.full_name || "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                  />
                                  <span className="text-sm font-medium text-[#22292f] leading-5">
                                    {user.full_name || "Unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <span className="text-sm text-[#22292f] leading-5">
                                  {user.role || "Member"}
                                </span>
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <span className="text-sm text-[#22292f] leading-5">
                                  {formatDate(user.created_at)}
                                </span>
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <StatusBadge status={user.status} />
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <ProfileStatusBadge status={user.profile_status} />
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <div className="relative">
                                  <ActionMenu
                                    onViewActivity={() => setViewActivityUser(user)}
                                    onEdit={() => setEditUser(user)}
                                    onDelete={() => setDeleteUser(user)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#eceff2]">
                    <button className="w-8 h-8 flex items-center justify-center border border-[#d5dde2] rounded-lg text-[#516778] hover:bg-[#f0f2f5] transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-[#516778]">
                      Page <span className="font-semibold text-[#22292f]">1</span> of{" "}
                      <span className="font-semibold text-[#22292f]">{Math.max(1, Math.ceil(filteredUsers.length / 10))}</span>
                    </span>
                    <button className="w-8 h-8 flex items-center justify-center border border-[#d5dde2] rounded-lg text-[#516778] hover:bg-[#f0f2f5] transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={handleMutationSuccess}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onSuccess={handleMutationSuccess}
        />
      )}

    </>
  );
}
