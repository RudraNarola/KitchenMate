"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import UploadSection from "@/components/demand/UploadSection";
import StatsSummary from "@/components/demand/StatsSummary";
import DataTable from "@/components/demand/DataTable";
import ForecastDashboard from "@/components/demand/ForecastDashboard";
import useFileUpload from "@/hooks/useFileUpload";

// Utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function DemandPage() {
  const [activePage, setActivePage] = useState("get_demand_analysys");
  const {
    file,
    data,
    season,
    loading,
    error,
    forecastData,
    setSeason,
    handleFileChange,
    handleUpload,
    setFile
  } = useFileUpload();

  // Make sure data is an array before using array methods
  const safeData = Array.isArray(data) ? data : [];

  // Calculate summary stats safely
  const totalConsumption = safeData.reduce(
    (sum, item) => sum + (item.consumption || 0),
    0
  );
  const highRiskCount = safeData.filter((item) => item.high_risk).length;
  const uniqueIngredients = [...new Set(safeData.map((item) => item.ingredient || ""))].length;

  // Transform forecast data for components
  const predictedMeals = forecastData?.top_meal_details?.map(meal => ({
    id: Number(meal[0]),
    name: String(meal[1]),
    cuisine: String(meal[2]),
    predictedOrders: Number(meal[3])
  })) || [];
  
  const ingredientRequirements = forecastData?.ingredient_requirements?.map(item => ({
    name: String(item[0]),
    quantity: Number(item[1])
  })) || [];

  // Extract meal and ingredient names for the graphs and capitalize first letter
  const mealNames = predictedMeals.map(meal => capitalizeFirstLetter(meal.name));
  const ingredientNames = ingredientRequirements.map(ing => capitalizeFirstLetter(ing.name));

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Demand Analysis
          </h1>
          <p className="text-gray-400 mt-2">
            Upload your ingredient consumption data to analyze demand patterns
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <h2 className="text-xl font-bold text-center text-white">
              Upload Consumption Data
            </h2>
          </div>
          
          <div className="p-6">
            <UploadSection
              file={file}
              setFile={setFile}
              season={season}
              loading={loading}
              error={error}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              setSeason={setSeason}
            />
          </div>
        </div>

        {/* Show forecast dashboard if we have forecast data */}
        {forecastData && (
          <div className="mb-8">
            <ForecastDashboard
              predictedMeals={predictedMeals}
              ingredientRequirements={ingredientRequirements}
              topMealImages={forecastData?.forecast_images?.topMealImages}
              topIngredientImages={forecastData?.forecast_images?.topIngredientImages}
              mealNames={mealNames}
              ingredientNames={ingredientNames}
            />
          </div>
        )}

        {/* Show the original consumption data table if available */}
        {safeData.length > 0 && (
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <h2 className="text-xl font-bold text-center text-white">
                Historical Data Analysis
              </h2>
            </div>
            
            <div className="p-6">
              <StatsSummary 
                uniqueIngredients={uniqueIngredients}
                totalConsumption={totalConsumption}
                highRiskCount={highRiskCount}
              />
              <DataTable data={safeData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}