"use client";
import { useState, useCallback } from "react";
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
  ChefHat,
  DollarSign,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

type MenuItem = {
  name: string;
  ingredients: string[];
  cost: number;
  profit_margin: number;
  special_occasion: boolean;
};

type OptimizationResult = {
  daily_specials: MenuItem[];
  cost_optimizations: {
    item: string;
    current_cost: number;
    suggested_cost: number;
    potential_savings: number;
  }[];
  new_dishes: MenuItem[];
};

export default function MenuOptimizationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("menu-optimization");
  const [results, setResults] = useState<OptimizationResult | null>(null);

  const handleOptimize = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/optimize-menu");
      setResults(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to optimize menu. Please try again."
      );
      console.error("Error optimizing menu:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Menu Optimization
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered menu optimization for better profitability and creativity
          </p>
        </div>

        <div className="mb-8">
          <Button
            onClick={handleOptimize}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Optimize Menu</span>
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-red-400 text-sm flex items-center space-x-2 bg-red-900/20 p-3 rounded-md mb-8">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            {/* Daily Specials */}
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
                  {results.daily_specials.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                    >
                      <h3 className="font-medium text-gray-200">{item.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients.map((ingredient, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-300"
                          >
                            {ingredient}
                          </Badge>
                        ))}
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Optimizations */}
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
                  {results.cost_optimizations.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                    >
                      <h3 className="font-medium text-gray-200">{item.item}</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Current Cost:</span>
                          <span className="ml-2 text-gray-200">
                            ${item.current_cost.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Suggested Cost:</span>
                          <span className="ml-2 text-green-400">
                            ${item.suggested_cost.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Potential Savings:</span>
                          <span className="ml-2 text-green-400">
                            ${item.potential_savings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Dishes */}
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
                  {results.new_dishes.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 space-y-2"
                    >
                      <h3 className="font-medium text-gray-200">{item.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients.map((ingredient, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-300"
                          >
                            {ingredient}
                          </Badge>
                        ))}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 