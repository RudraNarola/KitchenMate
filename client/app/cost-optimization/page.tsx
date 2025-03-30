"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, TrendingUp, ShoppingBasket } from "lucide-react";

export default function CostOptimizationPage() {
  const [activePage, setActivePage] = useState("cost-optimization");

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Optimization Cards */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>Ingredient Cost Analysis</span>
              </CardTitle>
              <CardDescription>
                Analyze and optimize ingredient costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Detailed analysis of ingredient costs and potential savings
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current Cost: $1,234</span>
                  <span className="text-green-400">Potential Savings: $123</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span>Portion Optimization</span>
              </CardTitle>
              <CardDescription>
                Optimize portion sizes for better profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Recommendations for optimal portion sizes to maximize profit
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current Margin: 25%</span>
                  <span className="text-green-400">Optimized Margin: 35%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBasket className="h-5 w-5 text-green-400" />
                <span>Supplier Cost Comparison</span>
              </CardTitle>
              <CardDescription>
                Compare and optimize supplier costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Analysis of supplier costs and recommendations for better deals
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current Cost: $2,345</span>
                  <span className="text-green-400">Best Deal: $2,100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}