import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Plus,
  Image as ImageIcon,
  DollarSign,
  Utensils,
  Upload,
  Link,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Dish {
  _id?: string;
  name: string;
  photo: string;
  price: number;
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

interface DishFormProps {
  onSubmit: (dish: Dish) => void;
  onAnalyzeImage: (photo: string) => Promise<Ingredient[]>;
  isFetchingIngredients: boolean;
}

export function DishForm({ onSubmit, onAnalyzeImage, isFetchingIngredients }: DishFormProps) {
  const [error, setError] = useState("");
  const [newDish, setNewDish] = useState<Dish>({
    name: "",
    photo: "",
    price: 0,
    ingredients: [],
  });
  const [priceInput, setPriceInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState("g");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const measuringUnits = [
    { value: "g", label: "grams" },
    { value: "kg", label: "kilograms" },
    { value: "ml", label: "milliliters" },
    { value: "l", label: "liters" },
    { value: "cup", label: "cups" },
    { value: "tbsp", label: "tablespoons" },
    { value: "tsp", label: "teaspoons" },
    { value: "oz", label: "ounces" },
    { value: "lb", label: "pounds" },
    { value: "pcs", label: "pieces" },
    { value: "pinch", label: "pinch" },
    { value: "whole", label: "whole" },
  ];

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.photo || !newDish.price) {
      setError("Please fill in all fields");
      return;
    }

    onSubmit(newDish);
  };

  const resetForm = () => {
    setNewDish({
      name: "",
      photo: "",
      price: 0,
      ingredients: [],
    });
    setPriceInput("");
    setError("");
    setPreviewImage(null);
    setPhotoFileName(null);
    setIngredientInput("");
    setIngredientQuantity("1");
    setSelectedUnit("g");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewDish((prevDish) => ({
          ...prevDish,
          photo: result,
        }));
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImageSelect = async (url: string) => {
    setNewDish((prevDish) => ({
      ...prevDish,
      photo: url,
    }));

    if (url.trim()) {
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      const quantity = parseFloat(ingredientQuantity) || 1;
      setNewDish({
        ...newDish,
        ingredients: [...newDish.ingredients, { 
          name: ingredientInput.trim(), 
          quantity,
          unit: selectedUnit 
        }],
      });
      setIngredientInput("");
      setIngredientQuantity("1");
      setSelectedUnit("g");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...newDish.ingredients];
    updatedIngredients.splice(index, 1);
    setNewDish({ ...newDish, ingredients: updatedIngredients });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-900 to-indigo-900 pb-6">
        <CardTitle className="text-2xl text-white">Create New Dish</CardTitle>
        <CardDescription className="text-gray-200">
          Upload a photo to automatically detect ingredients
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Dish Photo
            </label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex space-x-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(true)}
                  className={`flex-1 ${
                    showUrlInput
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-gray-800 border-gray-600"
                  }`}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(false)}
                  className={`flex-1 ${
                    !showUrlInput
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-gray-800 border-gray-600"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>

              {showUrlInput ? (
                <div className="relative mb-3">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter photo URL"
                    value={newDish.photo}
                    onChange={(e) => handleUrlImageSelect(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 w-full"
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-10 px-4 border border-gray-600 rounded-md bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {photoFileName ? photoFileName : "Choose Image"}
                  </label>
                </div>
              )}

              <div
                className={`aspect-video relative rounded-lg overflow-hidden border border-gray-700 ${
                  !previewImage
                    ? "flex items-center justify-center bg-gray-700"
                    : ""
                }`}
              >
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    {isFetchingIngredients && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-2" />
                          <p className="text-sm text-white">
                            Fetching ingredients...
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Eye className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">
                      Upload an image to auto-detect ingredients
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Dish Name
            </label>
            <div className="relative">
              <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter dish name"
                value={newDish.name}
                onChange={(e) =>
                  setNewDish({ ...newDish, name: e.target.value })
                }
                className="pl-10 bg-gray-800 border-gray-700 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Price</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                placeholder="Enter price"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  const price = parseFloat(e.target.value) || 0;
                  setNewDish({ ...newDish, price });
                }}
                className="pl-10 bg-gray-800 border-gray-700 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex justify-between items-center">
              <span>Ingredients</span>
              <Button
                onClick={async () => {
                  if (newDish.photo) {
                    const ingredients = await onAnalyzeImage(newDish.photo);
                    setNewDish(prev => ({
                      ...prev,
                      ingredients
                    }));
                  }
                }}
                disabled={!newDish.photo || isFetchingIngredients}
                className="bg-purple-600 hover:bg-purple-700 text-sm"
              >
                {isFetchingIngredients ? (
                  <div className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Fetching...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    Fetch from Photo
                  </div>
                )}
              </Button>
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add ingredient"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                className="pl-4 bg-gray-800 border-gray-700 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={ingredientQuantity}
                onChange={(e) => setIngredientQuantity(e.target.value)}
                className="pl-2 w-20 bg-gray-800 border-gray-700 rounded-lg"
                min="1"
              />
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
              >
                <SelectTrigger className="w-24 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {measuringUnits.map((unit) => (
                    <SelectItem
                      key={unit.value}
                      value={unit.value}
                      className="text-gray-200 hover:bg-gray-700"
                    >
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddIngredient}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 min-h-15 p-3 bg-gray-800/50 rounded-md border border-gray-700">
              {newDish.ingredients.length > 0 ? (
                newDish.ingredients.map((ingredient, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 bg-purple-900/60 text-purple-200 rounded-lg flex items-center gap-1 group"
                  >
                    <span className="text-l">{ingredient.name} ({ingredient.quantity} {ingredient.unit})</span>
                    <button
                      onClick={() => handleRemoveIngredient(i)}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  {isFetchingIngredients ? "Fetching ingredients..." : "Upload an image or add ingredients manually"}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center p-6 bg-gray-800 border-t border-gray-700">
        <div>
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 px-3 rounded-md">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Clear Form
          </Button>
          <Button
            onClick={handleAddDish}
            disabled={isFetchingIngredients}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6"
          >
            {isFetchingIngredients ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
               Create Dish
              </div>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 