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

export function AIDish() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedDishes, setGeneratedDishes] = useState<AIDish[]>([]);
  const [message, setMessage] = useState("");
  const [showCustomIngredients, setShowCustomIngredients] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<
    CustomIngredient[]
  >([{ name: "", quantity: 0, completed: false }]);

  const generateFromInventory = async () => {
    setLoading(true);
    setError("");
    setShowCustomIngredients(false);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8080/generate-dishes",
        {
          type: "inventory",
        }
      );

      if (response.data.success) {
        setGeneratedDishes(response.data.dishes);
      } else {
        setError(response.data.message || "Failed to generate dishes");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          setError(
            "Could not connect to the server. Please make sure the Flask server is running on port 5001."
          );
        } else if (error.response) {
          setError(
            error.response.data.message ||
              "Server error occurred. Please try again."
          );
        } else {
          setError(
            "Network error occurred. Please check your connection and try again."
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateFromCustomIngredients = async () => {
    // Validate ingredients
    const validIngredients = customIngredients.filter(
      (ing) => ing.name.trim() && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      setError("Please add at least one ingredient with name and quantity");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/generate-dishes",
        {
          type: "custom",
          ingredients: validIngredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
          })),
          message: message.trim(),
        }
      );

      if (response.data.success) {
        setGeneratedDishes(response.data.dishes);
      } else {
        setError(response.data.message || "Failed to generate dishes");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          setError(
            "Could not connect to the server. Please make sure the Flask server is running on port 5001."
          );
        } else if (error.response) {
          setError(
            error.response.data.message ||
              "Server error occurred. Please try again."
          );
        } else {
          setError(
            "Network error occurred. Please check your connection and try again."
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    // If there are no ingredients, add the first one
    if (customIngredients.length === 0) {
      setCustomIngredients([{ name: "", quantity: 0, completed: false }]);
      return;
    }

    // Check if the last ingredient exists and has a name
    const lastIngredient = customIngredients[customIngredients.length - 1];
    if (lastIngredient && lastIngredient.name.trim()) {
      setCustomIngredients([
        ...customIngredients,
        { name: "", quantity: 0, completed: false },
      ]);
    } else {
      setError("Please enter an ingredient name before adding another");
    }
  };

  const removeIngredient = (index: number) => {
    setCustomIngredients(customIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof CustomIngredient,
    value: string | number | boolean
  ) => {
    const newIngredients = [...customIngredients];
    if (field === "quantity") {
      const numValue = parseInt(value as string) || 0;
      newIngredients[index] = { ...newIngredients[index], [field]: numValue };
    } else {
      newIngredients[index] = { ...newIngredients[index], [field]: value };
    }
    setCustomIngredients(newIngredients);
  };

  const toggleIngredientComplete = (index: number) => {
    updateIngredient(index, "completed", !customIngredients[index].completed);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                AI Dish Generator
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Generate creative dishes using AI based on available inventory or
              custom ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={generateFromInventory}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Generate from Inventory
                      </div>
                    )}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={() =>
                      setShowCustomIngredients(!showCustomIngredients)
                    }
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {showCustomIngredients
                        ? "Hide Custom Ingredients"
                        : "Generate from Custom Ingredients"}
                    </div>
                  </Button>
                </motion.div>
              </div>

              <AnimatePresence>
                {showCustomIngredients && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Custom Ingredients
                      </label>
                      <div className="space-y-2">
                        {customIngredients.map((ingredient, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2 items-center group bg-gray-800/50 p-3 rounded-lg hover:bg-gray-800/70 transition-colors duration-200"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleIngredientComplete(index)}
                              className={cn(
                                "transition-colors duration-200",
                                ingredient.completed
                                  ? "text-green-400 hover:text-green-500"
                                  : "text-gray-400 hover:text-gray-300"
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 flex gap-2 items-center">
                              <div className="flex-[3]">
                                <Input
                                  placeholder="Ingredient name"
                                  value={ingredient.name}
                                  onChange={(e) =>
                                    updateIngredient(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-gray-900 border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-colors duration-200"
                                />
                              </div>
                              <div className="flex-[1] flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Qty"
                                  value={ingredient.quantity || ""}
                                  onChange={(e) =>
                                    updateIngredient(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-gray-900 border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-colors duration-200"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeIngredient(index)}
                                  className="text-gray-400 hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              onClick={addIngredient}
                              className="w-50% bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-purple-500 transition-all duration-200"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Ingredient
                            </Button>
                          </motion.div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Custom Message (Optional)
                          </label>
                          <Textarea
                            placeholder="Add any specific requirements or preferences (e.g., vegetarian, spicy, etc.)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-gray-900 border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-colors duration-200 h-20"
                          />
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={generateFromCustomIngredients}
                            disabled={loading || customIngredients.length === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Dishes
                              </div>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {generatedDishes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Generated Dishes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedDishes.map((dish, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-purple-400" />
                    <span>{dish.name || "Unnamed Dish"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">
                      Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dish.ingredients && dish.ingredients.length > 0 ? (
                        dish.ingredients.map((ingredient, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-300"
                          >
                            {typeof ingredient === "string"
                              ? ingredient
                              : `${ingredient.name} (${ingredient.quantity} ${ingredient.unit})`}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">
                          No ingredients listed.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">
                      Recipe
                    </h4>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      {dish.recipe &&
                      Array.isArray(dish.recipe.steps) &&
                      dish.recipe.steps.length > 0 ? (
                        <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                          {dish.recipe.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      ) : typeof dish.recipe === "string" ? (
                        <p className="text-sm text-gray-300">{dish.recipe}</p>
                      ) : (
                        <p className="text-sm text-gray-300">
                          No recipe available.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-gray-400">
                        Cost: ${dish.cost?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <span className="text-green-400">
                      Profit: {dish.profit_margin || 0}%
                    </span>
                  </div>
                  {dish.special_occasion && (
                    <Badge className="bg-yellow-900/40 text-yellow-300">
                      Special Occasion
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
