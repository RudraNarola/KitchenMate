import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Sparkles, ChefHat } from "lucide-react";
import { Dish } from "../types";
import Link from "next/link";

interface Menu {
  _id: string;
  name: string;
  description: string;
  dishes: Dish[];
  created_at: string;
  updated_at: string;
}

export function Menu() {
  return (
    <div className="flex gap-4 mb-8">
      <Link href="/get_optimized_menu/CreateDishPage">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Dish
        </Button>
      </Link>

      <Link href="/get_optimized_menu/CreateMenuForm">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <ChefHat className="mr-2 h-4 w-4" />
          Create New Menu
        </Button>
      </Link>
    </div>
  );
}
