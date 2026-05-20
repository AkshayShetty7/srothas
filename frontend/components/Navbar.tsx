"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  KeyRound,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

import { removeToken } from "@/lib/auth";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Navbar() {
  const router = useRouter();

  const [accountOpen, setAccountOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleSignOut = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-28 h-9">
              <Image
                src="/srothas_logo.webp"
                alt="Srothas"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "left",
                }}
              />
            </div>

            <div className="hidden sm:block h-5 w-px bg-gray-200" />

            <span className="hidden sm:block text-xs font-semibold text-gray-500 tracking-wider uppercase">
              Room Management
            </span>
          </Link>

          {/* Center */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#3d6b3a] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Right */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#3d6b3a] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  SA
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg shadow-gray-200/80 border border-gray-100 py-1 z-50">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Account
                </p>

                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setAccountOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  Change Password
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </>
  );
}