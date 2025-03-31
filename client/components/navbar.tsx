"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Utensils,
  LineChart,
  Menu,
  ChefHat,
  ScanSearch,
  Sparkles,
  DollarSign,
  Brain,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavbarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export function Navbar({ activePage, onPageChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [intelligenceValue, setIntelligenceValue] = useState<string>("");
  const router = useRouter();

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const handleIntelligenceChange = (value: string) => {
    setIntelligenceValue(value);
    onPageChange(value);
    
    // Navigate to the selected page
    if (value === "daily-specials") {
      router.push("/daily-specials");
    } else if (value === "cost-optimization") {
      router.push("/cost-optimization");
    }
  };

  // Get the appropriate icon and label based on the active page
  const getIntelligenceDisplay = () => {
    if (activePage === "daily-specials") {
      return {
        icon: <Sparkles className="h-5 w-5 text-purple-400" />,
        label: "Daily Specials"
      };
    } else if (activePage === "cost-optimization") {
      return {
        icon: <DollarSign className="h-5 w-5 text-green-400" />,
        label: "Cost Optimization"
      };
    }
    return {
      icon: <Brain className="h-5 w-5 text-purple-400" />,
      label: "Intelligence"
    };
  };

  const intelligenceDisplay = getIntelligenceDisplay();

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
              href="/get_demand_analysys"
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
              href="/get_optimized_menu"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                activePage === "menu"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => onPageChange("menu")}
            >
              <ChefHat className="h-5 w-5" />
              <span>Menu & Dish Creation</span>
            </Link>
            <Link
              href="/get_dish_generated"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                activePage === "ai-dishes"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => onPageChange("ai-dishes")}
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Dish</span>
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

            {/* Intelligence Dropdown */}
            <div className="relative">
              <Select value={intelligenceValue} onValueChange={handleIntelligenceChange}>
                <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                  {intelligenceDisplay.icon}
                  <SelectValue placeholder={intelligenceDisplay.label} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem 
                    value="daily-specials"
                    className="hover:bg-purple-900/30 focus:bg-purple-900/40 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                      Daily Specials
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="cost-optimization"
                    className="hover:bg-purple-900/30 focus:bg-purple-900/40 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                      Cost Optimization
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}