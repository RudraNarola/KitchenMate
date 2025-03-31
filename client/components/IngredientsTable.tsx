import React from 'react';
import { CheckCircle, AlertCircle, PieChart, Carrot } from 'lucide-react';

// Define the ingredient interface based on the new data format
export interface Ingredient {
  ingredient: string;
  detection_confidence: number;
  health_status: string;
  health_confidence: number;
  bounding_box?: [number, number, number, number];
}

interface IngredientsTableProps {
  ingredients: Ingredient[] | { [key: string]: any } | null;
  isLoading?: boolean;
}

const IngredientsTable: React.FC<IngredientsTableProps> = ({ ingredients, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="mt-4 bg-gray-800 rounded-xl border border-gray-700 p-4 text-center w-full max-w-2xl mx-auto">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Analyzing ingredients...</p>
        </div>
      </div>
    );
  }

  if (!ingredients || 
      (Array.isArray(ingredients) && ingredients.length === 0) || 
      (!Array.isArray(ingredients) && Object.keys(ingredients).length === 0)) {
    return (
      <div className="mt-4 bg-gray-800 rounded-xl border border-gray-700 p-4 text-center w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">No ingredients detected</p>
        </div>
      </div>
    );
  }

  // Handle both array and object with nested arrays
  const ingredientsArray = Array.isArray(ingredients) ? ingredients : 
    (ingredients.detected_objects ? ingredients.detected_objects : []);

  // Calculate summary numbers
  const totalItems = ingredientsArray.length;
  const freshItems: number = ingredientsArray.filter((item: Ingredient) => 
    item.health_status && item.health_status.toLowerCase().includes('fresh')
  ).length;
  const spoiledItems = totalItems - freshItems;

  // Use summary from response if available
  const summary = !Array.isArray(ingredients) && ingredients.summary ? ingredients.summary : null;
  const responseTotals = !Array.isArray(ingredients) && ingredients.total_items ? {
    total: ingredients.total_items,
    fresh: ingredients.total_fresh,
    spoiled: ingredients.total_spoiled
  } : null;

  // Create a map to count quantities by ingredient
  const ingredientQuantities = ingredientsArray.reduce((acc: {[key: string]: {fresh: number, spoiled: number}}, item: Ingredient) => {
    const name = item.ingredient;
    const isFresh = item.health_status.toLowerCase().includes('fresh');
    
    if (!acc[name]) {
      acc[name] = { fresh: 0, spoiled: 0 };
    }
    
    if (isFresh) {
      acc[name].fresh += 1;
    } else {
      acc[name].spoiled += 1;
    }
    
    return acc;
  }, {});

  return (
    <div className="mt-4 overflow-hidden w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
          <h2 className="text-lg font-medium text-white">Detected Ingredients</h2>
        </div>

        {/* Quick Summary Section - Added above the table */}
        <div className="bg-gray-800/70 px-5 py-4 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center mb-1">
                <Carrot className="h-4 w-4 text-indigo-400 mr-2" />
                <span className="text-xs font-medium text-gray-400 uppercase">Total Items</span>
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {responseTotals ? responseTotals.total : totalItems}
              </div>
            </div>
            
            <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center mb-1">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs font-medium text-gray-400 uppercase">Fresh</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {responseTotals ? responseTotals.fresh : freshItems}
              </div>
            </div>
            
            <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center mb-1">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-xs font-medium text-gray-400 uppercase">Spoiled</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {responseTotals ? responseTotals.spoiled : spoiledItems}
              </div>
            </div>
          </div>
        </div>
        
        {/* Ingredient summary section - MOVED ABOVE TABLE */}
        {summary && (
          <div className="border-b border-gray-700">
            <div className="px-5 py-3 bg-gray-800">
              <div className="flex items-center">
                <PieChart className="h-4 w-4 text-indigo-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-200">Ingredient Summary</h3>
              </div>
            </div>
            <div className="p-4 bg-gray-850">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(summary).map(([ingredient, status]) => {
                  const freshCount = (status as any).Fresh || 0;
                  const spoiledCount = (status as any).Spoiled || 0;
                  const unknownCount = (status as any).Unknown || 0;
                  const total = freshCount + spoiledCount + unknownCount;
                  
                  // Calculate percentages for the progress bar
                  const freshPercentage = total > 0 ? (freshCount / total) * 100 : 0;
                  const spoiledPercentage = total > 0 ? (spoiledCount / total) * 100 : 0;
                  
                  return (
                    <div key={ingredient} className="bg-gray-800 rounded-md p-3 border border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-200 capitalize">{ingredient}</h4>
                        <span className="text-xs text-gray-400">Total: {total}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 flex rounded-full overflow-hidden bg-gray-700 mb-2">
                        {freshCount > 0 && (
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${freshPercentage}%` }}
                          ></div>
                        )}
                        {spoiledCount > 0 && (
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${spoiledPercentage}%` }}
                          ></div>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          <span className="text-gray-400">Fresh: {freshCount}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                          <span className="text-gray-400">Spoiled: {spoiledCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Main ingredients table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/70">
              <tr className="border-b border-gray-700">
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700">
                  Ingredient
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700">
                  Quantity
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Health Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                {ingredientsArray.map((item: Ingredient, index: number) => {
                const isSpoiled: boolean = !item.health_status.toLowerCase().includes('fresh');
                const quantity = ingredientQuantities[item.ingredient];
                return (
                  <tr key={`${item.ingredient}-${index}`} className="hover:bg-gray-800/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-200 border-r border-gray-700/50 capitalize">
                      {item.ingredient}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-700/50">
                      {quantity.fresh + quantity.spoiled}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isSpoiled ? (
                        <div className="flex items-center">
                          <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-900/30 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                          </span>
                          <span className="ml-1.5 text-sm font-medium text-red-400">{item.health_status}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-900/30 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                          </span>
                          <span className="ml-1.5 text-sm font-medium text-green-400">{item.health_status}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer with timestamp */}
        <div className="bg-gray-800/70 px-5 py-3 border-t border-gray-700">
          <div className="flex justify-end items-center">
            <p className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsTable;