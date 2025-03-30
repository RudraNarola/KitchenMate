"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { DishForm } from "./components/DishForm";
import { DishCollection } from "./components/DishCollection";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  _id?: string;
  name: string;
  photo: string;
  price: number;
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

interface DishPageProps {
  onAddDish: (dish: Dish) => void;
  dishes: Dish[];
}

export function DishPage({ onAddDish, dishes: initialDishes }: DishPageProps) {
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleDeleteDish = async (dishId: string) => {
    try {
      // Send delete request immediately without confirmation
      const response = await axios.delete(`http://localhost:8080/dishes/${dishId}`);
      
      if (response.data.success) {
        // Remove dish from state
        setDishes(dishes.filter(dish => dish._id !== dishId));
        // No success alert
      }
    } catch (err) {
      console.error("Failed to delete dish:", err);
    }
  };

  
  const fetchDishes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get-dishes");
      if (response.data && response.data.success) {
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
    } catch (err) {
      console.error("Error fetching dishes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDish = async (newDish: Dish) => {
    try {
      const formData = new FormData();
      formData.append("name", newDish.name);
      formData.append("price", newDish.price.toString());
      formData.append("ingredients", JSON.stringify(newDish.ingredients));

      if (newDish.photo.startsWith("http")) {
        formData.append("photo_url", newDish.photo);
      } else {
        const response = await fetch(newDish.photo);
        const blob = await response.blob();
        formData.append("photo_file", blob, "dish_photo.jpg");
      }

      const response = await axios.post(
        "http://localhost:8080/add-dish",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        const newDishWithPhoto = {
          ...response.data.dish,
          photo: response.data.dish.photo.startsWith("http")
            ? response.data.dish.photo
            : `http://localhost:8080${response.data.dish.photo}`,
        };

        setDishes((prevDishes) => [...prevDishes, newDishWithPhoto]);
        onAddDish(newDishWithPhoto);
      }
    } catch (err) {
      console.error("Failed to add dish:", err);
    }
  };

  const analyzeImageForIngredients = async (photo: string) => {
    setIsFetchingIngredients(true);
    try {
      const formData = new FormData();

      if (photo.startsWith("http")) {
        formData.append("image_url", photo);
      } else {
        const response = await fetch(photo);
        const blob = await response.blob();
        formData.append("image_file", blob, "dish_photo.jpg");
      }

      const response = await axios.post(
        "http://localhost:8080/analyze-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.ingredients) {
        return response.data.ingredients;
      }
      return [];
    } catch (err) {
      console.error("Failed to analyze image:", err);
      return [];
    } finally {
      setIsFetchingIngredients(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <DishForm
        onSubmit={handleAddDish}
        onAnalyzeImage={analyzeImageForIngredients}
        isFetchingIngredients={isFetchingIngredients}
      />

      {/* Current Dishes */}
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : dishes.length > 0 ? (
        <div>
        
        <DishCollection 
  dishes={dishes} 
  isLoading={isLoading} 
  onDeleteDish={handleDeleteDish} 
/>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No dishes added yet
        </div>
      )}
    </div>
  );
}
