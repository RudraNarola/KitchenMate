import { BarChart2 as ChartBarIcon } from "lucide-react";
import PredictedMealsCard from "./PredictedMealsCard";
import IngredientForecastCard from "./IngredientForecastCard";


type PredictedMeal = {
  id: number;
  name: string;
  cuisine: string;
  predictedOrders: number;
};

type IngredientRequirement = {
  name: string;
  quantity: number;
};

interface ForecastDashboardProps {
  predictedMeals: PredictedMeal[];
  ingredientRequirements: IngredientRequirement[];
}

export default function ForecastDashboard({
  predictedMeals,
  ingredientRequirements
}: ForecastDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-2 rounded-lg mr-3">
          <ChartBarIcon className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200">
          AI Forecast Results
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictedMealsCard meals={predictedMeals} />
        <IngredientForecastCard ingredients={ingredientRequirements} />
      </div>
    </div>
  );
}