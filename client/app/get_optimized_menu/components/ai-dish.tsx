"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  ChefHat,
  DollarSign,
  Package,
  Plus,
  Trash2,
  Check,
  ShoppingBasket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIDish {
  name: string;
  description: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  cost: number;
  recipe: {
    steps: string[];
  };
  profit_margin: number;
  special_occasion: boolean;
}

interface CustomIngredient {
  name: string;
  quantity: number;
  completed: boolean;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Dish {
  name: string;
  description: string;
  recipe: {
    steps: string[];
  };
  ingredients: Ingredient[];
  cost: number;
  profit_margin: number;
  special_occasion: boolean;
}

interface AIDishProps {
  onDishesGenerated: (dishes: Dish[]) => void;
}

export default function AIDish({ onDishesGenerated }: AIDishProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generationType, setGenerationType] = useState<"inventory" | "custom">("inventory");
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);

  const handleGenerateDishes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/generate-dishes", {
        type: generationType,
        message: message,
        ingredients: customIngredients,
      });

      if (response.data.success) {
        onDishesGenerated(response.data.dishes);
      }
    } catch (error) {
      console.error("Error generating dishes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <ChefHat className="h-5 w-5 text-purple-400" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            AI Dish Generator
          </h2>
        </div>
        <p className="text-gray-400">
          Generate creative dishes based on your inventory or custom ingredients
        </p>
      </motion.div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>Generate Dishes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Generation Type</label>
            <div className="flex space-x-4">
              <Button
                variant={generationType === "inventory" ? "default" : "outline"}
                onClick={() => setGenerationType("inventory")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ShoppingBasket className="h-4 w-4 mr-2" />
                Inventory Based
              </Button>
              <Button
                variant={generationType === "custom" ? "default" : "outline"}
                onClick={() => setGenerationType("custom")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Custom Ingredients
              </Button>
            </div>
          </div>

          {generationType === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Custom Ingredients
              </label>
              <div className="flex flex-wrap gap-2">
                {customIngredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-900/40 text-purple-300"
                  >
                    {ingredient}
                    <button
                      onClick={() =>
                        setCustomIngredients((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="ml-1 text-purple-300 hover:text-purple-400"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add ingredient..."
                  className="flex-1 bg-gray-800 border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setCustomIngredients((prev) => [
                        ...prev,
                        e.currentTarget.value.trim(),
                      ]);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="text"]'
                    ) as HTMLInputElement;
                    if (input?.value.trim()) {
                      setCustomIngredients((prev) => [
                        ...prev,
                        input.value.trim(),
                      ]);
                      input.value = "";
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Additional Requirements
            </label>
            <textarea
              placeholder="Enter any specific requirements or preferences..."
              className="w-full bg-gray-800 border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerateDishes}
            disabled={isLoading || (generationType === "custom" && customIngredients.length === 0)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Dishes...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Dishes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
