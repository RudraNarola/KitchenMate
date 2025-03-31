import { useState, useCallback } from "react";
import axios from "axios";

export type DataItem = {
  date: string;
  ingredient: string;
  consumption: number;
  type?: "daily" | "monthly";
  high_risk: boolean;
};

type IngredientRequirement = [string, number];
type MealPrediction = [number, string, string, number];

type ForecastData = {
  ingredient_requirements: IngredientRequirement[];
  top_meal_details: MealPrediction[];
};

export default function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [season, setSeason] = useState("winter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
        setError("");
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("date", new Date().toISOString().split("T")[0]);
    if (season) formData.append("season", season);

    try {
      const response = await axios.post(
        "http://localhost:8080/upload_csv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Handle historical consumption data
      if (response.data.consumption_data) {
        setData(response.data.consumption_data);
      } else if (Array.isArray(response.data)) {
        // Fallback if the API returns direct array
        setData(response.data);
      }

      // Handle forecast data
      if (response.data.ingredient_requirements && response.data.top_meal_details) {
        setForecastData({
          ingredient_requirements: response.data.ingredient_requirements,
          top_meal_details: response.data.top_meal_details
        });
      }
      // Handle nested data structure
      else if (response.data.data && response.data.data.ingredient_requirements) {
        setForecastData({
          ingredient_requirements: response.data.data.ingredient_requirements,
          top_meal_details: response.data.data.top_meal_details
        });
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, [file, season]);

  return {
    file,
    data,
    season,
    loading,
    error,
    forecastData,
    setFile,
    setSeason,
    handleFileChange,
    handleUpload,
  };
}