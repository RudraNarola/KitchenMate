"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, TrendingUp, ShoppingBasket } from "lucide-react";
import axios from "axios";

interface PredictionResult {
  top_meal_details: Array<[string, string, string, number]>;
  ingredient_requirements: Array<[string, number]>;
  top_ingredients: Array<[string, number]>;
  top_meals: Array<[string, number]>;
}

interface GraphUrls {
  top_ingredients: string[];
  top_meals: string[];
  requirements: string;
}

export default function DemandPortal() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [graphUrls, setGraphUrls] = useState<GraphUrls>({
    top_ingredients: [],
    top_meals: [],
    requirements: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // First, upload and process the file
      const response = await axios.post(
        "http://localhost:8080/predict-ingredient",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setResult(response.data.data);
        
        // Then, get the graph URLs
        const graphResponse = await axios.get("http://localhost:8080/get-graphs");
        console.log("Graph response:", graphResponse.data); // Debug log
        
        if (graphResponse.data.success) {
          setGraphUrls(graphResponse.data.graphs);
        }
      } else {
        setError(response.data.message || "Failed to process file");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while processing the file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar activePage="demand_portal" onPageChange={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Demand Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file">Upload Consumption Data</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !file}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Data
                      </>
                    )}
                  </Button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
            </form>

            {result && (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Meals Section */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <span>Top Predicted Meals</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.top_meal_details.map((meal, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-700 rounded-lg space-y-2"
                          >
                            <h4 className="font-medium text-purple-300">
                              {meal[1]} - {meal[2]}
                            </h4>
                            <p className="text-sm text-gray-300">
                              Predicted Orders: {meal[3].toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Display top meal forecast graphs */}
                      {graphUrls.top_meals.map((graphName) => (
                        <div key={graphName} className="mt-4">
                          <img
                            src={`http://localhost:8080/api/graphs/${graphName}`}
                            alt={`Forecast for ${graphName}`}
                            className="w-full rounded-lg"
                            onError={(e) => console.error(`Error loading image: ${graphName}`)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Ingredient Requirements Section */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ShoppingBasket className="h-5 w-5 text-purple-400" />
                        <span>Ingredient Requirements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.ingredient_requirements.map((ingredient, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-700 rounded-lg space-y-2"
                          >
                            <h4 className="font-medium text-purple-300">
                              {ingredient[0].charAt(0).toUpperCase() + ingredient[0].slice(1)}
                            </h4>
                            <p className="text-sm text-gray-300">
                              Required Quantity: {ingredient[1].toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Display ingredient forecast graphs */}
                      {graphUrls.top_ingredients.map((graphName) => (
                        <div key={graphName} className="mt-4">
                          <img
                            src={`http://localhost:8080/api/graphs/${graphName}`}
                            alt={`Forecast for ${graphName}`}
                            className="w-full rounded-lg"
                            onError={(e) => console.error(`Error loading image: ${graphName}`)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Overall Requirements Graph */}
                {graphUrls.requirements && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        <span>Overall Ingredient Requirements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={`http://localhost:8080/api/graphs/${graphUrls.requirements}`}
                        alt="Overall Ingredient Requirements"
                        className="w-full rounded-lg"
                        onError={(e) => console.error(`Error loading image: ${graphUrls.requirements}`)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 