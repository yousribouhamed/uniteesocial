"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Users,
  Building2,
  Megaphone,
  Calendar,
  MoreVertical,
  LogOut,
  ChevronDown,
  Shield,
  UserRound,
  Trophy,
  Moon,
  Settings,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { AriaSwitch } from "@/components/ui/aria-switch";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const sidebarSections: { title: string; items: SidebarItem[] }[] = [
  {
    title: "Organization & Settings",
    items: [
      { icon: Building2, label: "Business Profile", href: "/admin/business-profile" },
      { icon: Users, label: "Users Account Management", href: "/admin/users" },
      { icon: Megaphone, label: "Communication", href: "#" },
    ],
  },
  {
    title: "Event Management",
    items: [
      {
        icon: Calendar,
        label: "Events",
        href: "/admin/events",
        children: [
          { label: "Team Management", href: "#" },
          { label: "Player Management", href: "#" },
          { label: "League Management", href: "#" },
        ],
      },
    ],
  },
];

export interface CurrentUser {
  email: string | undefined;
  full_name: string | null;
  avatar_url: string | null;
}

export default function AdminSidebar({ currentUser }: { currentUser: CurrentUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLogoutMenu(false);
      }
    }
    if (showLogoutMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutMenu]);

  return (
    <aside className="flex flex-col justify-between w-[325px] min-h-screen bg-white border-r border-[#eceff2] rounded-tr-xl rounded-br-xl p-4">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/img/unitee-logo.png" alt="Unitee Social" width={40} height={40} className="rounded-lg" />
          <span className="text-[#22292f] text-xl font-semibold">Unitee Social</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg">
          <Search className="w-4 h-4 text-[#668091]" />
          <span className="flex-1 text-sm text-[#668091]">Search ...</span>
          <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded">⌘K</span>
        </div>

        <div className="h-px bg-[#eceff2] w-full" />

        {/* Nav sections */}
        <nav className="flex flex-col gap-12">
          {sidebarSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-[#859bab]">{section.title}</span>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.href) && item.href !== "#";
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.label} className="flex flex-col">
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors w-full text-left ${
                          isActive
                            ? "bg-[#dbeafe] text-[#3f52ff]"
                            : "text-[#859bab] hover:bg-[#f0f2f5]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </div>
                        {hasChildren && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? "rotate-0" : "-rotate-90"}`} />
                        )}
                      </Link>
                      {hasChildren && isActive && (
                        <div className="flex flex-col gap-1 ml-6 mt-1 border-l border-[#eceff2] pl-4">
                          {item.children!.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="text-sm font-medium text-[#859bab] hover:text-[#22292f] py-2 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer with logout */}
      <div className="relative" ref={menuRef}>
        <div
          className="bg-[#eceff2] flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[#e0e4e8] transition-colors"
          onClick={() => setShowLogoutMenu(!showLogoutMenu)}
        >
          <div className="flex items-center gap-4">
            <Image
              src={currentUser.avatar_url || "/img/unitee-logo.png"}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-2xl"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#22292f]">
                {currentUser.full_name || "User"}
              </span>
              <span className="text-sm font-medium text-[#859bab]">
                {currentUser.email || "email@example.com"}
              </span>
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-[#22292f]" />
        </div>

        {showLogoutMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg pt-2 pb-4 px-2 flex flex-col gap-4">
            {/* Menu Options */}
            <div className="flex flex-col gap-3">
              {/* Dark Mode */}
              <div className="flex items-center justify-between h-9 px-2 py-1.5 rounded hover:bg-[#f0f2f5] transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <Moon className="w-4 h-4 text-[#22292f]" />
                  <span className="text-sm font-medium text-[#22292f]">Dark Mode</span>
                </div>
                <AriaSwitch
                  isSelected={darkMode}
                  onChange={setDarkMode}
                  aria-label="Toggle dark mode"
                />
              </div>

              {/* View Profile */}
              <button
                onClick={() => {
                  setShowLogoutMenu(false);
                  // Navigate to profile if needed
                }}
                className="flex items-center justify-between h-9 px-2 py-1.5 rounded hover:bg-[#f0f2f5] transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <UserRound className="w-4 h-4 text-[#22292f]" />
                  <span className="text-sm font-medium text-[#22292f]">View Profile</span>
                </div>
                <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded h-5 flex items-center">⌘KP</span>
              </button>

              {/* Account Setting */}
              <button
                onClick={() => {
                  setShowLogoutMenu(false);
                  // Navigate to settings if needed
                }}
                className="flex items-center justify-between h-9 px-2 py-1.5 rounded hover:bg-[#f0f2f5] transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Settings className="w-4 h-4 text-[#22292f]" />
                  <span className="text-sm font-medium text-[#22292f]">Account Setting</span>
                </div>
                <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded h-5 flex items-center">⌘S</span>
              </button>

              {/* Divider */}
              <div className="h-px bg-[#eceff2] w-full" />

              {/* Sign Out */}
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center justify-between h-9 px-2 py-1.5 rounded hover:bg-red-50 transition-colors w-full"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <LogOut className="w-4 h-4 text-[#e22023]" />
                    <span className="text-sm font-medium text-[#e22023]">Sign Out</span>
                  </div>
                  <span className="bg-[#eceff2] text-[#859bab] text-[10px] font-semibold px-1.5 py-0.5 rounded h-5 flex items-center">⌥⇧Q</span>
                </button>
              </form>
            </div>

            {/* Footer: Version & Terms */}
            <div className="px-2">
              <span className="text-sm font-medium text-[#859bab]">v1.0 - Terms & Conditions</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
