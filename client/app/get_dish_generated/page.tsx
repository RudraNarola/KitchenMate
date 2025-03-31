"use client";

import { Navbar } from "@/components/navbar";
import { AIDish } from "../get_optimized_menu/components/ai-dish";

export default function AIDishPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage="get_dish_generated" onPageChange={() => {}} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <AIDish />
      </div>
    </div>
  );
} 