import { Dish } from "../DishPage";
import { DishCard } from "./DishCard";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DishCollectionProps {
  dishes: Dish[];
  isLoading: boolean;
  onDeleteDish?: (dishId: string) => Promise<void>;
  onSelectDish?: (dishId: string) => void;
  selectedDishIds?: string[];
}

export function DishCollection({
  dishes,
  isLoading,
  onDeleteDish,
  onSelectDish,
  selectedDishIds = []
}: DishCollectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteDish = async (dishId: string) => {
    if (!onDeleteDish) return;
    
    setDeletingId(dishId);
    try {
      await onDeleteDish(dishId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Available Dishes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <div key={dish._id} className="relative">
            <DishCard
              dish={dish}
              isSelected={selectedDishIds.includes(dish._id || "")}
              onSelect={onSelectDish}
              onDelete={onDeleteDish ? handleDeleteDish : undefined}
            />
            {deletingId === dish._id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}
          </div>
        ))}
        
        {dishes.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            No dishes available
          </div>
        )}
      </div>
    </div>
  );
}