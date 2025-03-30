"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat, DollarSign, ShoppingBasket, Sparkles } from "lucide-react";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Dish {
  _id: string;
  name: string;
  price: number;
  ingredients: Ingredient[];
  photo?: string;
}

interface Menu {
  _id: string;
  name: string;
  description: string;
  dishes: Dish[];
}

export default function CostOptimizationPage() {
  const [activePage, setActivePage] = useState("cost-optimization");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizingMenuId, setOptimizingMenuId] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<{[key: string]: any}>({});

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
              : "/placeholder-dish.jpg"
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

  const calculateTotalCost = (dishes: Dish[]) => {
    return dishes.reduce((total, dish) => total + (dish.price || 0), 0);
  };

  const handleOptimizeCost = async (menu: Menu) => {
    setOptimizingMenuId(menu._id);
    try {
      console.log("Sending request for menu ID:", menu._id);
      const response = await axios.post("http://localhost:8080/optimize-cost", {
        menu_id: menu._id.toString(),
      });

      console.log("Received response:", response.data);
      if (response.data.success) {
        setOptimizationResults(prev => ({
          ...prev,
          [menu._id]: response.data.data
        }));
      }
    } catch (error) {
      console.error("Error optimizing menu cost:", error);
    } finally {
      setOptimizingMenuId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-200">
        <Navbar activePage={activePage} onPageChange={setActivePage} />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Cost Optimization
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered cost optimization recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((menu) => (
            <Card key={menu._id} className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-purple-400" />
                    <span>{menu.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {menu.description}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleOptimizeCost(menu)}
                  disabled={optimizingMenuId === menu._id}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {optimizingMenuId === menu._id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Optimize Cost
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menu.dishes.map((dish) => (
                    <div
                      key={dish._id}
                      className="bg-gray-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={dish.photo}
                          alt={dish.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{dish.name}</h3>
                          <p className="text-sm text-purple-400">
                            ${dish.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400">Ingredients:</h4>
                        <div className="flex flex-wrap gap-2">
                          {dish.ingredients.map((ingredient, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-900/40 text-purple-300"
                            >
                              {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Menu Cost:</span>
                      <span className="text-xl font-semibold text-green-400">
                        ${calculateTotalCost(menu.dishes).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Optimization Results */}
                  {optimizationResults[menu._id] && (
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                      <h4 className="text-sm font-medium text-purple-400">Optimization Results:</h4>
                      {optimizationResults[menu._id].cost_optimizations?.map((optimization: any, index: number) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{optimization.item || 'Unknown Item'}</span>
                            <span className="text-sm text-green-400">
                              Save ${(optimization.potential_savings || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">
                              Current: ${(optimization.current_cost || 0).toFixed(2)}
                            </span>
                            <span className="text-xs text-green-400">
                              Suggested: ${(optimization.suggested_cost || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}