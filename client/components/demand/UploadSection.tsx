import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertTriangle, FileSpreadsheet } from "lucide-react";
import SeasonsSelector from "./SeasonsSelector";

type UploadSectionProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  season: string;
  loading: boolean;
  error: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  setSeason: (value: string) => void;
};

export default function UploadSection({
  file,
  setFile,
  season,
  loading,
  error,
  handleFileChange,
  handleUpload,
  setSeason,
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events for the drop zone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Only accept Excel files
      if (
        file.name.endsWith('.csv')
      ) {
        // Update the file state directly instead of using handleFileChange
        setFile(file);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {!file ? (
        <div
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-900/20"
              : "border-gray-600 bg-gray-800/50 hover:bg-gray-800/80"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center py-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-indigo-900/30 p-3">
                <FileSpreadsheet className="h-12 w-12 text-indigo-400" />
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-300 mb-2">
              Drag & Drop Excel File
            </h3>
            <p className="text-gray-400 mb-6">
              or click to select file from your computer
            </p>

            <div className="flex justify-center">
              <label className="bg-indigo-700 text-indigo-100 hover:bg-indigo-600 px-6 py-3 rounded-xl cursor-pointer transition-colors flex items-center shadow-md">
                <Upload className="h-5 w-5 mr-2" />
                Select File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-5">
              Supported formats: CSV 
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl mb-4">
            <div className="p-4 flex items-center space-x-4">
              <div className="bg-indigo-900/30 p-3 rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-indigo-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-200 truncate">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setFile(null)}
                className="bg-red-500/30 hover:bg-red-600/40 text-red-200 p-2 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 border-t border-gray-700 space-y-4">
              
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition-colors mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Analyze Data</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 text-red-300 rounded-xl border border-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}