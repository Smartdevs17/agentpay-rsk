"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  Wallet,
  LogOut
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export const Sidebar = ({ isOpen, onClose, onDisconnect }: SidebarProps) => {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Escrow", href: "/dashboard/new", icon: PlusCircle },
    { name: "Transactions", href: "/dashboard/history", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-rsk-dark/80 backdrop-blur-2xl border-r border-white/5 z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center shadow-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Agent<span className="text-rsk-orange">Pay</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-rsk-orange/10 text-rsk-orange border border-rsk-orange/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-rsk-orange" : "text-white/40 group-hover:text-white"
                )} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => { onDisconnect(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Disconnect Wallet</span>
          </button>
        </div>
      </aside>
    </>
  );
};
