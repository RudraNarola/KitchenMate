"use client";
import { DishPage } from "../DishPage";
import { useState } from "react";
import { Dish } from "../DishPage"; // Import Dish type from the same file as DishPage
import { Navbar } from "@/components/navbar";



export default function CreateDishPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activePage, setActivePage] = useState("dishes");

  const handleAddDish = (dish: Dish) => {
    setDishes([...dishes, dish]);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      <div className="container mx-auto px-4 py-8">
        <DishPage onAddDish={handleAddDish} dishes={dishes} />
      </div>
    </div>
  );
}
