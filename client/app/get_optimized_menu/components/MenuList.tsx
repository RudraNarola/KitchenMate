"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Trash2,
  Sparkles,
  ChefHat,
  DollarSign,
  Plus,
} from "lucide-react";
import { Menu } from "../types";
import Link from "next/link";

export function MenuList() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizingMenuId, setOptimizingMenuId] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get("http://localhost:8080/menus");
      if (response.data.success) {
        const menusWithCorrectUrls = response.data.menus.map((menu: Menu) => ({
          ...menu,
          dishes: menu.dishes.map((dish) => ({
            ...dish,
            photo: dish.photo 
              ? (dish.photo.startsWith("http") 
                  ? dish.photo 
                  : `http://localhost:8080${dish.photo}`)
              : "/placeholder-dish.jpg" // Fallback image if photo is missing
          })),
        }));
        setMenus(menusWithCorrectUrls);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/menus/${menuId}`
      );
      if (response.data.success) {
        setMenus(menus.filter((menu) => menu._id !== menuId));
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const handleOptimizeMenu = async (menu: Menu) => {
    setOptimizingMenuId(menu._id);
    setSelectedMenu(menu);
    try {
      const response = await axios.post("http://localhost:8080/optimize-menu", {
        dishes: menu.dishes,
      });

      if (response.data) {
        // Check if the response has the expected structure
        const results = {
          daily_specials: response.data.daily_specials || [],
          cost_optimizations: response.data.cost_optimizations || [],
          new_dishes: response.data.new_dishes || [],
        };
        setOptimizationResults(results);
      }
    } catch (error) {
      console.error("Error optimizing menu:", error);
      // You might want to show an error message to the user here
    } finally {
      setOptimizingMenuId(null);
    }
  };

  const calculateTotalCost = (dishes: any[]) => {
    return dishes.reduce((total, dish) => total + (dish.price || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Your Created Menus</h2>
        <Link href="/get_optimized_menu/CreateMenuForm">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Menu
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menus.map((menu) => (
          <Card
            key={`menu-${menu._id}`}
            className="bg-gray-900 border-gray-800"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">{menu.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {menu.description}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMenu(menu._id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {menu.dishes.map((dish, index) => (
                  <div
                    key={`menu-${menu._id}-dish-${dish._id || index}`}
                    className="flex items-center space-x-4 bg-gray-800 p-3 rounded-lg"
                  >
                    <img
                      src={dish.photo}
                      alt={dish.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="text-white font-medium">{dish.name}</h3>
                      <p className="text-sm text-purple-400">
                        ${dish.price?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-xl font-semibold text-green-400">
                      ${calculateTotalCost(menu.dishes).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Results */}
      {optimizationResults && selectedMenu && (
        <div className="space-y-8 mt-8">
          <h2 className="text-xl font-semibold text-white">
            Optimization Results for {selectedMenu.name}
          </h2>

          {/* Daily Specials */}
          {optimizationResults.daily_specials.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-purple-400" />
                  <span>AI-Recommended Daily Specials</span>
                </CardTitle>
                <CardDescription>
                  Special dishes based on surplus ingredients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationResults.daily_specials.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                      >
                        <h3 className="font-medium text-gray-200">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.ingredients.map(
                            (ingredient: string, i: number) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-purple-900/40 text-purple-300"
                              >
                                {ingredient}
                              </Badge>
                            )
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Cost: ${item.cost.toFixed(2)}
                          </span>
                          <span className="text-green-400">
                            Profit: {item.profit_margin}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Optimizations */}
          {optimizationResults.cost_optimizations.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span>Cost Optimization Suggestions</span>
                </CardTitle>
                <CardDescription>
                  Recommendations for improving profitability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationResults.cost_optimizations.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                      >
                        <h3 className="font-medium text-gray-200">
                          {item.item}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Current Cost:</span>
                            <span className="ml-2 text-gray-200">
                              ${item.current_cost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Suggested Cost:
                            </span>
                            <span className="ml-2 text-green-400">
                              ${item.suggested_cost.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Potential Savings:
                            </span>
                            <span className="ml-2 text-green-400">
                              ${item.potential_savings.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Dishes */}
          {optimizationResults.new_dishes.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <span>AI-Generated New Dishes</span>
                </CardTitle>
                <CardDescription>
                  Creative new dishes based on available ingredients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationResults.new_dishes.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                      >
                        <h3 className="font-medium text-gray-200">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.ingredients.map(
                            (ingredient: string, i: number) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-purple-900/40 text-purple-300"
                              >
                                {ingredient}
                              </Badge>
                            )
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Cost: ${item.cost.toFixed(2)}
                          </span>
                          <span className="text-green-400">
                            Profit: {item.profit_margin}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
