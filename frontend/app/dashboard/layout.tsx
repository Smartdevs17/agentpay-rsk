"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { useWallet } from "../../context/WalletContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, connect, disconnect } = useWallet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-rsk-dark overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onDisconnect={disconnect} />
      <div className="flex-1 flex flex-col relative overflow-hidden lg:ml-64">
        <DashboardHeader
          address={address ?? undefined}
          onConnect={connect}
          onDisconnect={disconnect}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto pt-24 px-4 sm:px-8 pb-12">
          <div className="container mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
