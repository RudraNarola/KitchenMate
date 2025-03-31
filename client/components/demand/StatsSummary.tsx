import React from "react";
import { FileSpreadsheet, BarChart, AlertTriangle } from "lucide-react";

type StatsSummaryProps = {
  uniqueIngredients: number;
  totalConsumption: number;
  highRiskCount: number;
};

export default function StatsSummary({
  uniqueIngredients,
  totalConsumption,
  highRiskCount,
}: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/80 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Unique Ingredients</p>
            <p className="text-3xl font-bold mt-2 text-gray-100">{uniqueIngredients}</p>
          </div>
          <div className="bg-indigo-900/30 rounded-full p-3">
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">Distinct ingredients identified in dataset</p>
        </div>
      </div>
      
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/80 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Consumption</p>
            <p className="text-3xl font-bold mt-2 text-gray-100">{totalConsumption}</p>
          </div>
          <div className="bg-purple-900/30 rounded-full p-3">
            <BarChart className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">Aggregate amount consumed in units</p>
        </div>
      </div>
      
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/80 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">High Risk Items</p>
            <p className="text-3xl font-bold mt-2 text-red-400">{highRiskCount}</p>
          </div>
          <div className="bg-red-900/30 rounded-full p-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">Items requiring special handling</p>
        </div>
      </div>
    </div>
  );
}