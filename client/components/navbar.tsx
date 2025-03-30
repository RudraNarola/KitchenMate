"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Utensils,
  LineChart,
  Menu,
  ChefHat,
  ScanSearch,
} from "lucide-react";

interface NavbarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export function Navbar({ activePage, onPageChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur bg-opacity-90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={`flex items-center space-x-2.5 font-medium transition-colors ${
                activePage === "home"
                  ? "text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => onPageChange("home")}
            >
              <Utensils className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight">KitchenMate</span>
            </Link>
          </div>
          
          {/* Right side - Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/get_demand_analysys
              "
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                activePage === "get_demand_analysys"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => onPageChange("get_demand_analysys")}
            >
              <LineChart className="h-5 w-5" />
              <span>Demand Analysis</span>
            </Link>
            <Link
              href="/menu-optimization"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                activePage === "menu"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => onPageChange("menu")}
            >
              <ChefHat className="h-5 w-5" />
              <span>Menu Optimize</span>
            </Link>
            <Link
              href="/get_ingredients"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                activePage === "get_ingredients"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => onPageChange("get_ingredients")}
            >
              <ScanSearch className="h-5 w-5" />
              <span>Ingredient Scanner</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}