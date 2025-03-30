"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { QuickStats } from "@/components/home/QuickStats";
import { QuickActions } from "@/components/home/QuickActions";

export default function HomePage() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <WelcomeHeader 
          title="Kitchen Analytics Dashboard" 
          subtitle="Welcome to your kitchen management helper" 
        />
        
        <QuickStats />
        <QuickActions />
      </main>
    </div>
  );
}