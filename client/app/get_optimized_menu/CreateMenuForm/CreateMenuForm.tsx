import { useState } from "react";
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
import { DishCard } from "../components/DishCard";

interface CreateMenuFormProps {
  dishes: Dish[];
  onCreateMenu: (name: string, description: string, selectedDishes: string[]) => Promise<void>;
  isCreating: boolean;
}

export function CreateMenuForm({ dishes, onCreateMenu, isCreating }: CreateMenuFormProps) {
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
  });
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  const handleCreateMenu = async () => {
    if (!newMenu.name || selectedDishes.length === 0) {
      return;
    }
    await onCreateMenu(newMenu.name, newMenu.description, selectedDishes);
    setNewMenu({ name: "", description: "" });
    setSelectedDishes([]);
  };

  const toggleDishSelection = (dishId: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };

  return (
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
            onChange={(e) =>
              setNewMenu({ ...newMenu, name: e.target.value })
            }
            className="bg-gray-800 border-gray-700"
          />
          <Textarea
            placeholder="Menu Description"
            value={newMenu.description}
            onChange={(e) =>
              setNewMenu({ ...newMenu, description: e.target.value })
            }
            className="bg-gray-800 border-gray-700"
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
          disabled={isCreating || !newMenu.name || selectedDishes.length === 0}
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
  );
} 