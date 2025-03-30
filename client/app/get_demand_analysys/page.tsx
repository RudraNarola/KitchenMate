"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import UploadSection from "@/components/demand/UploadSection";
import StatsSummary from "@/components/demand/StatsSummary";
import DataTable from "@/components/demand/DataTable";
import useFileUpload from "@/hooks/useFileUpload";

export default function DemandPage() {
  const [activePage, setActivePage] = useState("demand");
  
  const {
    file,
    data,
    season,
    loading,
    error,
    setSeason,
    handleFileChange,
    handleUpload,
    setFile
  } = useFileUpload();

  // Calculate summary stats
  const totalConsumption = data.reduce(
    (sum, item) => sum + item.consumption,
    0
  );
  const highRiskCount = data.filter((item) => item.high_risk).length;
  const uniqueIngredients = [...new Set(data.map((item) => item.ingredient))].length;

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Demand Analysis
          </h1>
          <p className="text-gray-400 mt-2">
            Upload your ingredient consumption data to analyze demand patterns
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <h2 className="text-xl font-bold text-center text-white">
              Upload Consumption Data
            </h2>
          </div>
          
          <div className="p-6">
            <UploadSection
              file={file}
              setFile={setFile}
              season={season}
              loading={loading}
              error={error}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              setSeason={setSeason}
            />
          </div>
        </div>

        {data.length > 0 && (
          <>
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                <h2 className="text-xl font-bold text-center text-white">
                  Analysis Results
                </h2>
              </div>
              
              <div className="p-6">
                <StatsSummary 
                  uniqueIngredients={uniqueIngredients}
                  totalConsumption={totalConsumption}
                  highRiskCount={highRiskCount}
                />
                <DataTable data={data} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}