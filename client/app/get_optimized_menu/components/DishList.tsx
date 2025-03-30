"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Dish } from "../types";
import { DishCard } from "./DishCard";

export function DishList() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingDishId, setDeletingDishId] = useState<string | null>(null);

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
            photo: dish.photo && dish.photo.startsWith("http")
              ? dish.photo
              : `http://localhost:8080${dish.photo || ''}`,
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
  
  const handleDeleteDish = async (dishId: string) => {
    try {
      setDeletingDishId(dishId);
      const response = await axios.delete(`http://localhost:8080/dishes/${dishId}`);
      
      if (response.data.success) {
        // Remove the deleted dish from state
        setDishes(dishes.filter(dish => dish._id !== dishId));
      } else {
        console.error("Failed to delete dish:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
    } finally {
      setDeletingDishId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">All Dishes</h2>
        <Link href="/get_optimized_menu/CreateDishPage">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Dish
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <div key={dish._id} className="relative">
              <DishCard 
                dish={dish} 
                onDelete={handleDeleteDish}
              />
              {deletingDishId === dish._id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              )}
            </div>
          ))}
          
          {dishes.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-400">No dishes available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}