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

type PhoneCountry = { name: string; iso2: string; dial: string };

const PHONE_COUNTRIES: PhoneCountry[] = [
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

const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRIES.find((c) => c.iso2 === "AE") || PHONE_COUNTRIES[0];

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

const NATIONALITY_SELECT_OPTIONS = NATIONALITY_OPTIONS.map((name, index) => {
  const countryName = COUNTRY_OPTIONS[index];
  return {
    value: name,
    label: name,
    iso2: COUNTRY_ISO_LOOKUP[countryName],
  };
});

const parsePhoneValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) {
    return { country: DEFAULT_PHONE_COUNTRY, number: trimmed };
  }
  const matches = PHONE_COUNTRIES.filter((c) => trimmed.startsWith(`+${c.dial}`));
  if (matches.length === 0) {
    return { country: DEFAULT_PHONE_COUNTRY, number: trimmed.replace(/^\+/, "") };
  }
  const match = matches.sort((a, b) => b.dial.length - a.dial.length)[0];
  const number = trimmed.slice(match.dial.length + 1).trim();
  return { country: match, number };
};

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

function PhoneNumberInput({
  phone,
  onPhoneChange,
  country,
  onCountryChange,
  compactMobileSelector = false,
}: {
  phone: string;
  onPhoneChange: (value: string) => void;
  country: PhoneCountry;
  onCountryChange: (value: PhoneCountry) => void;
  compactMobileSelector?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const filtered = PHONE_COUNTRIES.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.dial.includes(q);
  });

  return (
    <div className="relative flex h-9 bg-card border border-border rounded-lg" ref={containerRef}>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 h-9 hover:bg-muted/70 transition-colors"
        >
          <span className="text-sm">{flagFor(country.iso2)}</span>
          <span className={compactMobileSelector ? "hidden sm:inline text-sm font-semibold text-foreground" : "text-sm font-semibold text-foreground"}>
            +{country.dial}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-72 bg-card border border-border rounded-lg shadow-lg">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 h-8 px-2 border border-border rounded-md">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code"
                  className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.map((c) => (
                <button
                  key={`${c.iso2}-${c.dial}`}
                  type="button"
                  onClick={() => {
                    onCountryChange(c);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                >
                  <span className="w-6">{flagFor(c.iso2)}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-muted-foreground">+{c.dial}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="w-px bg-border" />
      <input
        type="text"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="(555) 000-0000"
        className="flex-1 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
      />
    </div>
  );
}

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
    <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1">
      {isActive ? (
        <CheckCircle2 className="w-[18px] h-[18px] text-emerald-600 fill-emerald-600 stroke-white dark:text-emerald-300 dark:fill-emerald-300" />
      ) : (
        <XCircle className="w-[18px] h-[18px] text-red-500 fill-red-500 stroke-white dark:text-red-300 dark:fill-red-300" />
      )}
      <span className="text-sm font-medium text-foreground leading-[18px]">{status || "Unknown"}</span>
    </div>
  );
}

function ProfileStatusBadge({ status }: { status: ProfileStatus | null }) {
  const config: Record<ProfileStatus, { bg: string; text: string; border: string; dot: string }> = {
    Verified: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", dot: "bg-emerald-500 dark:bg-emerald-300" },
    "Not Verified": { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-600 dark:text-red-300", border: "border-red-200 dark:border-red-800/60", dot: "bg-red-500 dark:bg-red-300" },
    Completed: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60", dot: "bg-amber-500 dark:bg-amber-300" },
    Active: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", dot: "bg-emerald-500 dark:bg-emerald-300" },
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
      <MenuButton className="p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none">
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </MenuButton>

      <Portal>
        <MenuItems
          anchor="bottom end"
          transition
          className="z-[100] mt-1 bg-background border border-border rounded-xl p-1 shadow-lg w-[165px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
        >
          <MenuItem>
            <button
              onClick={onViewActivity}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-blue-100 dark:data-[focus]:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors text-foreground group focus:outline-none"
            >
              <Eye className="w-4 h-4" />
              View Activity
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-blue-100 dark:data-[focus]:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors text-foreground focus:outline-none"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium data-[focus]:bg-destructive/10 hover:bg-destructive/10 transition-colors text-destructive focus:outline-none"
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
      <div className="relative bg-card border border-border rounded-xl w-[420px] flex flex-col gap-4 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="bg-destructive/10 rounded-md p-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-base font-semibold text-foreground">
              Delete User
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
        <div className="flex items-center gap-3 px-4 pb-4 pt-2 border-t border-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted/70 transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-10 px-4 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
  const initialPhone = parsePhoneValue(user.phone || "");
  const [phone, setPhone] = useState(initialPhone.number);
  const [phoneCountry, setPhoneCountry] = useState(initialPhone.country);
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
    const directoryFieldsValue = user.directory_fields;
    if (directoryFieldsValue && Array.isArray(directoryFieldsValue)) {
      directoryFields.forEach((f) => {
        initial[f] = directoryFieldsValue.includes(f);
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
      const fullPhone = phone.trim()
        ? `+${phoneCountry.dial} ${phone.trim()}`
        : "";
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          full_name: `${firstName} ${lastName}`.trim(),
          role,
          status: userActivation ? "Active" : "Inactive",
          phone: fullPhone,
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
    <div className="flex flex-col gap-8 px-4 md:px-8 py-6">
      {/* Edit Header Bar */}
      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#3f52ff] dark:text-white" />
          </button>
          <span className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
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
      <div className="h-px bg-muted" />

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* Row 1: First Name + Last Name */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Kobe"
                className="h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] transition-colors"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Paras"
                className="h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Phone Number + Gender */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Phone Number</label>
              <PhoneNumberInput
                phone={phone}
                onPhoneChange={setPhone}
                country={phoneCountry}
                onCountryChange={setPhoneCountry}
                compactMobileSelector
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Gender</label>
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
              <label className="text-sm font-semibold text-foreground">Country</label>
              <SearchableSelect
                value={country}
                onChange={setCountry}
                options={COUNTRY_SELECT_OPTIONS}
                placeholder="Select"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Nationality</label>
              <SearchableSelect
                value={nationality}
                onChange={setNationality}
                options={NATIONALITY_SELECT_OPTIONS}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Row 4: Email + Password + Re-generate */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <div className="flex items-center h-9 px-3 bg-card border border-border rounded-lg gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yybouhamed@gmail.com"
                  className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="flex gap-4 items-start">
                <div className="flex items-center h-9 px-3 bg-card border border-border rounded-lg gap-2 flex-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                  />
                  <button
                    onClick={copyPassword}
                    className="shrink-0 p-0.5 hover:bg-muted/70 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <button
                  onClick={generatePassword}
                  className="h-9 px-3 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors shrink-0"
                >
                  Re-generate
                </button>
              </div>
              {/* Strength Meter */}
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full ${i < passedChecks ? "bg-emerald-500 dark:bg-emerald-300" : "bg-muted"
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
                      className={`w-3.5 h-3.5 ${check.passed ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"
                        }`}
                    />
                    <span
                      className={`text-xs ${check.passed ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"
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
              <label className="text-sm font-semibold text-foreground">Role</label>
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
        <div className="h-px bg-muted" />

        {/* User Activation */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">User Activation</span>
            <span className="text-xs font-semibold text-muted-foreground">
              Control whether this user account is active or inactive.
            </span>
          </div>
          <AriaSwitch isSelected={userActivation} onChange={setUserActivation} />
        </div>

        {/* Profile Directory Visibility */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Profile to be viewed in member directory section
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Control whether this user account is active or inactive.
              </span>
            </div>
            <AriaSwitch isSelected={profileVisible} onChange={setProfileVisible} />
          </div>

          {/* Checkboxes */}
          {profileVisible && (
            <div className="bg-muted rounded-lg p-2 flex flex-col gap-2">
              {directoryFields.map((field) => (
                <AriaCheckbox
                  key={field}
                  isSelected={checkedFields[field]}
                  onChange={() => toggleField(field)}
                >
                  <span className="font-medium text-foreground">{field}</span>
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
    <div className="flex flex-col gap-8 px-4 md:px-8 py-6">
      {/* View Activity Header Bar */}
      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center gap-2 p-2">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-[#3f52ff] dark:text-white" />
        </button>
        <span className="text-xl font-semibold text-[#3f52ff] dark:text-white leading-[18px]">
          View Activity
        </span>
      </div>

      {/* Activity Feed Card */}
      <div className="bg-card border border-border rounded-lg pt-3 px-3 flex flex-col">
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
                  <p className="text-base font-medium text-foreground">
                    {activity.userName}{" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                    {activity.highlight && (
                      <span className="text-foreground"> {activity.highlight}</span>
                    )}
                  </p>

                  {/* Badge: Completed */}
                  {activity.badge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 border border-border rounded-md w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {activity.badge.label}
                      </span>
                    </div>
                  )}

                  {/* Avatar group */}
                  {activity.avatarGroup && (
                    <div className="inline-flex items-center gap-[9px] border border-border rounded-full px-2 py-1.5 w-fit">
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
                      <span className="text-[13px] font-normal text-foreground">
                        +{activity.avatarGroup.extra}
                      </span>
                    </div>
                  )}

                  {/* File attachment */}
                  {activity.file && (
                    <div className="inline-flex items-center gap-6 px-4 py-1 border border-border rounded-md w-fit">
                      <div className="flex items-center gap-2">
                        <FileText className="w-[10px] h-[12.5px] text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {activity.file.name}
                        </span>
                      </div>
                      <Download className="w-[8.75px] h-[11.25px] text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Timestamp + Menu */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-medium text-muted-foreground">
                  {activity.timeAgo}
                </span>
                <button className="text-muted-foreground text-[15px] font-medium leading-[18px] rotate-90 -scale-y-100">
                  ...
                </button>
              </div>
            </div>

            {/* Separator between items */}
            {index < activities.length - 1 && (
              <div className="h-px bg-muted" />
            )}
          </div>
        ))}

        {/* Bottom separator */}
        <div className="h-px bg-muted" />
      </div>
    </div>
  );
}

// --- Add User Modal ---
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY);
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
      const fullPhone = phone.trim()
        ? `+${phoneCountry.dial} ${phone.trim()}`
        : "";
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: fullPhone,
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
      <div className="relative bg-card border border-border rounded-xl w-[800px] max-h-[90vh] overflow-y-auto flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="bg-[#3f52ff] border-[3px] border-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_0_1px_#3f52ff]" data-node-id="2868:13090">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17.0004C21 15.7702 19.7659 14.7129 18 14.25M3 17.0004C3 15.7702 4.2341 14.7129 6 14.25M18 10.2361C18.6137 9.68679 19 8.8885 19 8C19 6.34315 17.6569 5 16 5C15.2316 5 14.5308 5.28885 14 5.76389M6 10.2361C5.38625 9.68679 5 8.8885 5 8C5 6.34315 6.34315 5 8 5C8.76835 5 9.46924 5.28885 10 5.76389M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground leading-[25px]">
                Add User
              </span>
              <span className="text-sm font-medium text-muted-foreground leading-[18px]">
                Add users to your organisation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4 px-4 py-4">
          {/* Row 1: First Name + Last Name */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Kobe"
                className="h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] transition-colors"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Paras"
                className="h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#3f52ff] dark:focus:border-[#8faeff] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Phone Number + Gender */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Phone Number</label>
              <PhoneNumberInput
                phone={phone}
                onPhoneChange={setPhone}
                country={phoneCountry}
                onCountryChange={setPhoneCountry}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Gender</label>
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
              <label className="text-sm font-semibold text-foreground">Country</label>
              <SearchableSelect
                value={country}
                onChange={setCountry}
                options={COUNTRY_SELECT_OPTIONS}
                placeholder="Select"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Nationality</label>
              <SearchableSelect
                value={nationality}
                onChange={setNationality}
                options={NATIONALITY_SELECT_OPTIONS}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Row 4: Email + Password (with Re-generate) */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <div className="flex items-center h-9 px-3 bg-card border border-border rounded-lg gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yybouhamed@gmail.com"
                  className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="flex gap-4 items-start">
                <div className="flex items-center h-9 px-3 bg-card border border-border rounded-lg gap-2 flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                  />
                  <button
                    onClick={copyPassword}
                    className="shrink-0 p-0.5 hover:bg-muted/70 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <button
                  onClick={generatePassword}
                  className="h-9 px-3 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors shrink-0"
                >
                  Re-generate
                </button>
              </div>
              {/* Strength Meter */}
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full ${i < passedChecks ? "bg-emerald-500 dark:bg-emerald-300" : "bg-muted"
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
                      className={`w-3.5 h-3.5 ${check.passed ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"
                        }`}
                    />
                    <span
                      className={`text-xs ${check.passed ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"
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
              <label className="text-sm font-semibold text-foreground">Role</label>
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
        <div className="flex items-center justify-between px-4 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors disabled:opacity-50"
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
      <div className="flex min-h-screen w-full max-w-full bg-background font-[family-name:'Instrument_Sans',sans-serif]">
        <AdminSidebar currentUser={currentUser} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between pl-16 pr-4 md:px-8 py-3 bg-card border-b border-border">
            <nav className="flex items-center gap-0.5 text-sm">
              <span className="text-muted-foreground font-medium px-1 py-0.5">
                <CircleUserRound className="w-4 h-4 inline mr-1" />
              </span>
              {editUser || viewActivityUser ? (
                <>
                  <button
                    onClick={() => { setEditUser(null); setViewActivityUser(null); }}
                    className="text-muted-foreground font-medium px-1 py-0.5 hover:text-muted-foreground transition-colors"
                  >
                    Users Account Management
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium px-1 py-0.5">
                    {editUser ? "Edit" : "View Activity"}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground font-medium px-1 py-0.5">Users Account Management</span>
              )}
            </nav>
            <div className="bg-muted rounded-full p-[7px] relative">
              <Bell className="w-[17px] h-[17px] text-foreground" />
              {(editUser || viewActivityUser) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3f52ff] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto min-w-0">
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
              <div className="px-4 md:px-10 py-6">
                {/* Page header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-lg font-semibold text-[#3f52ff] dark:text-white">Users Account Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      This section enables you to manage your app members and Teams
                    </p>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground bg-card hover:bg-muted/70">
                    Members
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:flex md:items-stretch border border-border rounded-xl mb-6 bg-card overflow-hidden">
                  {[
                    { label: "Total Users", sub: "All registered users", value: totalUsers, color: "text-[#3f52ff] dark:text-white", Icon: Users },
                    { label: "Active Users", sub: totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}% of total` : "0%", value: activeUsers, color: "text-[#3f52ff] dark:text-white", Icon: Users },
                    { label: "Inactive Users", sub: totalUsers > 0 ? `${((inactiveUsers / totalUsers) * 100).toFixed(1)}% of total` : "0%", value: inactiveUsers, color: "text-[#3f52ff] dark:text-white", Icon: Users },
                  ].map((card, i) => (
                    <div
                      key={card.label}
                      className={`flex-1 flex items-center justify-between px-4 py-4 ${
                        i === 0
                          ? "col-span-2 md:col-span-1 border-b border-border md:border-b-0 md:border-r"
                          : i === 1
                            ? "border-r border-border"
                            : ""
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[30px] h-[30px] rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                          <card.Icon className="w-4 h-4 text-[#3f52ff] dark:text-white" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${card.color}`}>{card.label}</p>
                          <p className="text-xs text-muted-foreground">{card.sub}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-foreground">{card.value}</span>
                    </div>
                  ))}
                </div>

                {/* Search + Filter + Add User */}
                <div className="bg-card border border-border rounded-xl">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4">
                    <div className="order-2 md:order-1 w-full md:w-auto">
                      <div className="flex items-center gap-2 h-9 px-3 py-1 bg-card border border-border rounded-lg w-full md:w-[373px]">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search Users"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none p-0 focus:ring-0"
                        />
                        <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">⌘K</span>
                      </div>
                    </div>
                    <div className="order-1 md:order-2 flex items-center justify-end flex-wrap gap-2 w-full md:w-auto">
                      {selectedUserIds.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          disabled={bulkDeleting}
                          className="flex items-center gap-1.5 h-8 px-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="bg-destructive text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {selectedUserIds.size}
                          </span>
                        </button>
                      )}
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-[#3f52ff] text-white rounded-lg text-sm font-medium hover:bg-[#3545e0] transition-colors">
                        <Filter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleExportCSV}
                        disabled={selectedUserIds.size === 0}
                        className={`flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-lg transition-colors ${selectedUserIds.size > 0
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
                        {selectedUserIds.size > 0 && (
                          <span className="bg-card text-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
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
                    <div className="inline-flex items-center bg-muted rounded-lg p-1 relative">
                      {(["all", "active", "inactive"] as const).map((tab) => (
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
                              layoutId="activeTabIndicator"
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
                            {tab === "all" ? "All users" : tab === "active" ? "Active" : "Inactive"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table - Design System */}
                  <div className="w-full px-4 pb-4 md:px-0 md:pb-0 overflow-x-auto hide-scrollbar">
                    <table className="w-full min-w-[720px] table-auto">
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
                        <tr className="[&>th]:bg-muted">
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
                                <span className="text-sm font-medium text-foreground leading-5 whitespace-nowrap">
                                  {h}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {/* Table Body */}
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              className={`bg-card hover:bg-background transition-colors ${index < filteredUsers.length - 1 ? "border-b border-border" : ""
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
                                  <span className="text-sm font-medium text-foreground leading-5">
                                    {user.full_name || "Unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <span className="text-sm text-foreground leading-5">
                                  {user.role || "Member"}
                                </span>
                              </td>
                              <td className="h-[46px] px-3 py-2">
                                <span className="text-sm text-foreground leading-5">
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
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <button className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-muted/70 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page <span className="font-semibold text-foreground">1</span> of{" "}
                      <span className="font-semibold text-foreground">{Math.max(1, Math.ceil(filteredUsers.length / 10))}</span>
                    </span>
                    <button className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-muted/70 transition-colors">
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
