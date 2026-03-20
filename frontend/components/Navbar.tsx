"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Wallet, Shield } from "lucide-react";
import { PremiumButton } from "./ui/PremiumButton";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  address?: string;
  onConnect: () => void;
  hideLogo?: boolean;
}

export const Navbar = ({ address, onConnect, hideLogo }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 right-0 z-50 transition-all duration-300 px-4 py-4",
        hideLogo ? "left-0 lg:left-64" : "left-0",
        isScrolled ? "py-2" : "py-4"
      )}
    >
      <div className={cn(
        "container mx-auto max-w-7xl rounded-2xl transition-all duration-300",
        isScrolled ? "glass-nav shadow-lg px-6 py-2" : "bg-transparent px-4 py-2"
      )}>
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className={cn(
              "items-center gap-2 group",
              hideLogo ? "flex lg:hidden" : "flex"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-rsk-orange/20"
            >
              <Wallet className="h-5 w-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">
                Agent<span className="text-rsk-orange">Pay</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                Powered by RSK
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-rsk-orange"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            <PremiumButton
              variant={address ? "outline" : "premium"}
              size="sm"
              onClick={onConnect}
              className="hidden sm:flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {address ? (
                <span className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              ) : (
                "Connect Wallet"
              )}
            </PremiumButton>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="md:hidden mt-2 rounded-2xl glass-nav overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="p-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              <PremiumButton
                variant={address ? "outline" : "premium"}
                onClick={onConnect}
                className="w-full"
              >
                {address ? address.slice(0, 10) + "..." : "Connect Wallet"}
              </PremiumButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
