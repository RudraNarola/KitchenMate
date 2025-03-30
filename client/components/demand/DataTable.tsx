import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DataItem } from "@/hooks/useFileUpload";

type DataTableProps = {
  data: DataItem[];
};

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const filteredData = searchTerm
    ? data.filter(item => 
        item.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
      )
    : data;

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="overflow-hidden">
      {/* Centered search container */}
      <div className="flex justify-center mb-5">
        <div className="relative w-full max-w-md">
          <div className={`
            absolute left-3 top-1/2 transform -translate-y-1/2
            text-gray-400 transition-all duration-200
            ${isFocused || searchTerm ? "text-indigo-400" : "text-gray-500"}
          `}>
            <Search className="h-4 w-4" />
          </div>
          
          <Input
            placeholder="Search ingredients "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              bg-gray-800/80 border border-gray-700 pl-10 pr-10
              text-gray-200 placeholder:text-gray-500 w-full
              rounded-lg shadow-md transition-all duration-200
              hover:bg-gray-800 h-9
              ${isFocused 
                ? "outline-none ring-1 ring-indigo-500 border-indigo-500" 
                : "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"}
            `}
          />
          
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search results message - also centered */}
      {searchTerm && (
        <div className="flex justify-center mb-3">
          <div className="w-full max-w-md flex items-center justify-between px-1">
            <div className="text-sm">
              <span className="text-gray-400">Search results for </span>
              <span className="text-indigo-400 font-medium">"{searchTerm}"</span>
            </div>
            <div className="text-sm text-gray-400">
              {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/70">
              <tr className="border-b border-gray-700">
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700">
                  Time
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700">
                  Ingredient
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700">
                  Consumption
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50 divide-y divide-gray-800">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-800/80 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-700/50">
                    {item.date}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-200 border-r border-gray-700/50">
                    {item.ingredient}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-700/50">
                    {item.consumption}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {item.high_risk ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
                        High Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="py-12 text-center">
            <div className="bg-gray-800/60 inline-flex rounded-full p-3 mb-3">
              <Search className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">No results found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search term</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center px-1">
        <span>Data last updated: {new Date().toLocaleDateString()}</span>
        <span>Showing {filteredData.length} of {data.length} entries</span>
      </div>
    </div>
  );
}