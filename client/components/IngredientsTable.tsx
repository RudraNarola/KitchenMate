import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Define the ingredient interface
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  spoiled?: boolean;
}

interface IngredientsTableProps {
  ingredients: Ingredient[] | null;
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

  if (!ingredients || ingredients.length === 0) {
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

  return (
    <div className="mt-4 overflow-hidden w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
          <h2 className="text-lg font-medium text-white">Detected Ingredients</h2>
        </div>
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
                  Spoilage Risk
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50 divide-y divide-gray-800">
              {ingredients.map((ingredient, index) => (
                <tr key={`${ingredient.name}-${index}`} className="hover:bg-gray-800/80 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-200 border-r border-gray-700/50">
                    {ingredient.name}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-700/50">
                    {ingredient.quantity} {ingredient.unit}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {ingredient.spoiled ? (
                      <div className="flex items-center">
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-900/30 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                        </span>
                        <span className="ml-1.5 text-sm font-medium text-red-400">At Risk</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-900/30 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                        </span>
                        <span className="ml-1.5 text-sm font-medium text-green-400">Fresh</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800/70 px-5 py-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-right">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IngredientsTable;