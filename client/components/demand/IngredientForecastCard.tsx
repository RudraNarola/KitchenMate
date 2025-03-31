import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type IngredientRequirement = {
  name: string;
  quantity: number;
};

interface IngredientForecastCardProps {
  ingredients: IngredientRequirement[];
}

export default function IngredientForecastCard({ ingredients }: IngredientForecastCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"quantity" | "name">("quantity");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Filter and sort ingredients
  const filteredIngredients = [...ingredients]
    .filter(ing => 
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "quantity") {
        return b.quantity - a.quantity;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  
  // Pagination logic
  const totalItems = filteredIngredients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredIngredients.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "quantity" ? "name" : "quantity");
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900/30 p-2 rounded-lg">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <CardTitle className="text-xl text-gray-200">
              Ingredient Requirements
            </CardTitle>
          </div>
          <div className="bg-blue-900/20 text-blue-300 border-blue-800 px-3 py-1 rounded-full text-xs">
            Next Week Forecast
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {/* Search and Sort Controls */}
        <div className="flex items-center space-x-2 mb-5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder="Search ingredients..."
              className="pl-9 py-2 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
            />
          </div>
          <button 
            onClick={toggleSortOrder}
            className="p-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
            title={sortOrder === "quantity" ? "Sort by name" : "Sort by quantity"}
          >
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Ingredients Table */}
        <div className="rounded-lg border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ingredient
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Required Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentItems.map((item, index) => (
                <tr 
                  key={item.name} 
                  className={`${
                    index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-900/60'
                  } hover:bg-gray-700/30 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-300">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">
                    <span className="font-semibold">{item.quantity.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">units</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {currentItems.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-400">No matching ingredients found</p>
            </div>
          )}
        </div>
        
        {/* Pagination Controls with Items per page on left and pagination on right */}
        <div className="mt-6 py-3 border-t border-gray-800 flex flex-col sm:flex-row gap-y-3 justify-between items-center text-sm">
          {/* Items per page on the left */}
          <div className="flex items-center">
            <span className="text-gray-500 whitespace-nowrap mr-2">Items per page:</span>
            <Select 
              value={String(itemsPerPage)} 
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px] h-8 py-0 pl-2 pr-1 bg-gray-800 border-gray-700 text-gray-300">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination controls on the right */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex items-center justify-center bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page number indicators */}
            <div className="flex items-center space-x-1 mx-2">
              {totalPages <= 5 ? (
                // Show all page numbers if 5 or fewer
                Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 flex items-center justify-center ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))
              ) : (
                // Show pagination with ellipsis for many pages
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 flex items-center justify-center ${
                      currentPage === 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </Button>
                  
                  {currentPage > 3 && (
                    <span className="flex items-center justify-center h-8 w-8 text-gray-500">...</span>
                  )}
                  
                  {currentPage > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex items-center justify-center bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  
                  {currentPage !== 1 && currentPage !== totalPages && (
                    <Button
                      variant="default"
                      size="icon"
                      className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white"
                    >
                      {currentPage}
                    </Button>
                  )}
                  
                  {currentPage < totalPages - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex items-center justify-center bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                  
                  {currentPage < totalPages - 2 && (
                    <span className="flex items-center justify-center h-8 w-8 text-gray-500">...</span>
                  )}
                  
                  {totalPages > 1 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "ghost"}
                      size="icon"
                      className={`h-8 w-8 flex items-center justify-center ${
                        currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                      }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex items-center justify-center bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Summary Data */}
        <div className="mt-5 pt-3 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500">
          <span>
            Total quantity: {ingredients.reduce((sum, item) => sum + item.quantity, 0).toFixed(0)} units
          </span>
          <span>
            Showing {startIndex + 1} to {endIndex} of {totalItems} ingredients
          </span>
        </div>
      </CardContent>
    </Card>
  );
}