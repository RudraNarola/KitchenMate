import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Loader2, ImageOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ForecastGraphsCardProps {
  topMealImages?: string[];
  topIngredientImages?: string[];
  mealNames?: string[]; // Add meal names from forecast data
  ingredientNames?: string[]; // Add ingredient names from forecast data
}

export default function ForecastGraphsCard({ 
  topMealImages = [], 
  topIngredientImages = [],
  mealNames = [], 
  ingredientNames = []
}: ForecastGraphsCardProps) {
  const [activeTab, setActiveTab] = useState<string>("meals");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state based on whether images have loaded
    if ((activeTab === "meals" && topMealImages.length > 0) || 
        (activeTab === "ingredients" && topIngredientImages.length > 0)) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false); // If images don't load, stop loading after a delay
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, topMealImages, topIngredientImages]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", e.currentTarget.src);
    e.currentTarget.src = "/images/placeholder-graph.png"; // Fallback image
  };

  // Get meal names for display (use defaults if not provided)
  const getMealName = (index: number): string => {
    // If we have meal names from PredictedMealsCard, use them
    if (mealNames && mealNames.length > index) {
      return mealNames[index];
    }
    return `Meal ${index + 1}`;
  };
  
  // Get ingredient names for display (use defaults if not provided)
  const getIngredientName = (index: number): string => {
    // If we have ingredient names from IngredientForecastCard, use them
    if (ingredientNames && ingredientNames.length > index) {
      return ingredientNames[index];
    }
    return `Ingredient ${index + 1}`;
  };

  // Use actual data from the cards for graph URLs
  const getGraphImage = (type: 'meal' | 'ingredient', index: number) => {
    if (type === 'meal') {
      // If we have meal images, use them
      if (topMealImages && topMealImages.length > index) {
        return topMealImages[index];
      }
      
      // Otherwise, construct a URL using the meal name
      const mealName = getMealName(index).toLowerCase().replace(/\s+/g, '_');
      return `graph_images/category_forecast_${mealName}.png`;
    } else {
      // If we have ingredient images, use them
      if (topIngredientImages && topIngredientImages.length > index) {
        return topIngredientImages[index];
      }
      
      // Otherwise, construct a URL using the ingredient name
      const ingredientName = getIngredientName(index).toLowerCase().replace(/\s+/g, '_');
      return `graph_images/ingredient_forecast_${ingredientName}.png`;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-900/30 p-2 rounded-lg">
              <LineChart className="h-5 w-5 text-green-400" />
            </div>
            <CardTitle className="text-xl text-gray-200">
              Forecast Visualizations
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <Tabs defaultValue="meals" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger 
              value="meals"
              className="text-white data-[state=active]:bg-green-900/30 data-[state=active]:text-green-300"
            >
              Top Meals
            </TabsTrigger>
            <TabsTrigger 
              value="ingredients"
              className="text-white data-[state=active]:bg-green-900/30 data-[state=active]:text-green-300"
            >
              Ingredients
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="meals" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-800">
                    <div className="h-64 w-full">
                      <img
                        src={getGraphImage('meal', index)}
                        alt={`${getMealName(index)} forecast trend`}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-3 bg-gray-800/40 text-center text-gray-300 font-medium">
                      {getMealName(index)} Forecast
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ingredients" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-800">
                    <div className="h-64 w-full">
                      <img
                        src={getGraphImage('ingredient', index)}
                        alt={`${getIngredientName(index)} forecast trend`}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-3 bg-gray-800/40 text-center text-gray-300 font-medium">
                      {getIngredientName(index)} Forecast
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}