import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Utensils, LineChart, Apple, ShoppingBasket } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <StatCard 
        title="Total Ingredients" 
        value={24} 
        icon={<ShoppingBasket className="h-4 w-4 text-gray-400" />} 
      />
      <StatCard 
        title="Total Consumption" 
        value="1,234" 
        icon={<LineChart className="h-4 w-4 text-gray-400" />} 
      />
    </div>
  );
}