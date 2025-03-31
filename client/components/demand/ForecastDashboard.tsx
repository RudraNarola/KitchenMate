import { BarChart2 as ChartBarIcon } from "lucide-react";
import PredictedMealsCard from "./PredictedMealsCard";
import IngredientForecastCard from "./IngredientForecastCard";
import ForecastGraphsCard from "./ForecastGraphsCard";

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
  topMealImages?: string[];
  topIngredientImages?: string[];
  mealNames?: string[];
  ingredientNames?: string[];
}

export default function ForecastDashboard({
  predictedMeals,
  ingredientRequirements,
  topMealImages,
  topIngredientImages,
  mealNames,
  ingredientNames
}: ForecastDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictedMealsCard meals={predictedMeals} />
        <IngredientForecastCard ingredients={ingredientRequirements} />
      </div>
      
      <ForecastGraphsCard
        topMealImages={topMealImages}
        topIngredientImages={topIngredientImages}
        mealNames={mealNames}
        ingredientNames={ingredientNames}
      />
    </div>
  );
}