import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trash2 } from "lucide-react";
import { Dish } from "../DishPage";

interface DishCardProps {
  dish: Dish;
  isSelected?: boolean;
  onSelect?: (dishId: string) => void;
  onDelete?: (dishId: string) => void;
}

export function DishCard({ 
  dish, 
  isSelected = false, 
  onSelect,
  onDelete 
}: DishCardProps) {
  const handleClick = () => {
    if (onSelect && dish._id) {
      onSelect(dish._id);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when deleting
    if (onDelete && dish._id) {
      
        onDelete(dish._id);
      
    }
  };
  
  return (
    <Card
      className={`relative cursor-pointer transition-all ${
        isSelected
          ? "bg-purple-900/20 border-purple-500"
          : "bg-gray-800 border-gray-700 hover:border-purple-500/50"
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        <img
          src={dish.photo || "/placeholder-dish.jpg"}
          alt={dish.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-dish.jpg";
          }}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
            <Check className="h-8 w-8 text-purple-500" />
          </div>
        )}
        
        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
            aria-label="Delete dish"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-white">{dish.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-gray-400">
          <p>${dish.price?.toFixed(2) || "0.00"}</p>
          <p className="mt-1">
            {dish.ingredients?.length || 0} ingredients
          </p>
        </div>
      </CardContent>
    </Card>
  );
}