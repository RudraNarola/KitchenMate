import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PredictedMeal = {
  id: number;
  name: string;
  cuisine: string;
  predictedOrders: number;
};

interface PredictedMealsCardProps {
  meals: PredictedMeal[];
}

export default function PredictedMealsCard({ meals }: PredictedMealsCardProps) {
  // Sort by predicted orders (highest first)
  const sortedMeals = [...meals].sort((a, b) => b.predictedOrders - a.predictedOrders);

  // Helper to get cuisine-specific badges
  const getCuisineBadge = (cuisine: string) => {
    return (
      <Badge variant="outline" className="bg-gray-800/60 border-gray-600 text-gray-300">
        {cuisine}
      </Badge>
    );
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-purple-400" />
            </div>
            <CardTitle className="text-xl text-gray-200">
              Top Predicted Meals
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-800">
            Next 5 Days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          {sortedMeals.map((meal, index) => (
            <div 
              key={meal.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 
                  ? "bg-gradient-to-r from-purple-900/30 to-purple-800/10 border border-purple-800/30" 
                  : "bg-gray-800/30 border border-gray-700/30"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  flex items-center justify-center h-7 w-7 rounded-full 
                  ${index === 0 ? "bg-purple-700/50" : "bg-gray-700/50"}
                  text-sm font-bold text-gray-200
                `}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{meal.name}</h3>
                  <div className="mt-1">
                    {getCuisineBadge(meal.cuisine)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-gray-400 text-sm">Expected Orders</div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                  <span className="font-bold text-lg text-green-400">
                    {Math.round(meal.predictedOrders)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}