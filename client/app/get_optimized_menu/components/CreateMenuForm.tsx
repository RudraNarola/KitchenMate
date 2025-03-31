"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { Dish } from "../types";
import { DishCard } from "./DishCard";
import { MenuList } from "./MenuList";

export function CreateMenuForm() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);
  

  const fetchDishes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get-dishes");
      if (response.data.success) {
        const dishesWithCorrectUrls = response.data.dishes.map(
          (dish: Dish) => ({
            ...dish,
            photo: dish.photo.startsWith("http")
              ? dish.photo
              : `http://localhost:8080${dish.photo}`,
          })
        );
        setDishes(dishesWithCorrectUrls);
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleCreateMenu function for better error handling

const handleCreateMenu = async () => {
  if (!newMenu.name || selectedDishes.length === 0) {
    return;
  }

  setIsCreating(true);
  try {
    console.log("Creating menu with:", {
      name: newMenu.name,
      description: newMenu.description,
      dishes: selectedDishes,
    });

    const response = await axios.post("http://localhost:8080/menus", {
      name: newMenu.name,
      description: newMenu.description,
      dishes: selectedDishes,
    });

    console.log("Server response:", response.data);

    if (response.data.success) {
      setNewMenu({ name: "", description: "" });
      setSelectedDishes([]);
      // alert("Menu created successfully!");
      
      // Refresh the menu list if it's on the same page
      if (typeof window !== "undefined") {
        // This will trigger the MenuList component to refresh its data
        window.dispatchEvent(new CustomEvent("menuCreated"));
      }
    }
  } catch (error: any) {
    console.error("Error creating menu:", error);
    
    // Show more detailed error information to the user
    let errorMessage = "Failed to create menu. Please try again.";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data.message || errorMessage;
      console.error("Server error response:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your connection.";
    }
    
    // alert(errorMessage);
  } finally {
    setIsCreating(false);
  }
};

  const toggleDishSelection = (dishId: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }
  

  return (
    <div className="space-y-8">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Create New Menu</CardTitle>
          <CardDescription className="text-gray-400">
            Select dishes to create a custom menu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Menu Name"
              value={newMenu.name}
              onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              className="pl-3 bg-gray-800 border-gray-700"
            />
            <Textarea
              placeholder="Menu Description"
              value={newMenu.description}
              onChange={(e) =>
                setNewMenu({ ...newMenu, description: e.target.value })
              }
              className="bg-gray-800 border-gray-700 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <DishCard
                key={`dish-${dish._id}`}
                dish={dish}
                isSelected={selectedDishes.includes(dish._id)}
                onSelect={toggleDishSelection}
              />
            ))}
          </div>

          <Button
            onClick={handleCreateMenu}
            disabled={
              isCreating || !newMenu.name || selectedDishes.length === 0
            }
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Menu...
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Menu
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Display existing menus */}
      <MenuList />
    </div>
  );
}
