import React, { useEffect, useState } from "react";
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

interface IngredientData {
  detected_objects: any[];
  summary: {
    [key: string]: {
      Fresh: number;
      Spoiled: number;
      Unknown: number;
    };
  };
  total_fresh: number;
  total_items: number;
  total_spoiled: number;
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('detectedIngredients');
      if (storedData) {
        try {
          const parsedData: IngredientData = JSON.parse(storedData);
          setTotalItems(parsedData.total_items || 0);
          setTotalConsumption(parsedData.total_fresh || 0);
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <StatCard 
        title="Total Ingredients" 
        value={totalItems} 
        icon={<ShoppingBasket className="h-4 w-4 text-gray-400" />} 
      />
      <StatCard 
        title="Total Fresh Items" 
        value={totalConsumption} 
        icon={<LineChart className="h-4 w-4 text-gray-400" />} 
      />
    </div>
  );
}