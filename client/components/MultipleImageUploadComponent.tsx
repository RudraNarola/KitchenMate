import React, { useState, useRef } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { PlusCircle, X, Loader2, Package } from "lucide-react";
import { Ingredient } from "./IngredientsTable";
import { Button } from "@/components/ui/button";

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  ingredients?: Ingredient[] | null;
  isAnalyzing: boolean;
  error?: string;
}

interface MultipleImageUploadProps {
  uploadedImages: UploadedImage[];
  onImagesSelected: (files: File[]) => void;
  onImageRemove: (id: string) => void;
  isLoading: boolean;
}

const MultipleImageUploadComponent: React.FC<MultipleImageUploadProps> = ({
  uploadedImages,
  onImagesSelected,
  onImageRemove,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesSelected(Array.from(e.target.files));
      // Reset the file input to allow selecting the same files again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      onImagesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Upload area */}
      <div
        className={`w-full border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-indigo-500 bg-indigo-900/20"
            : "border-gray-600 bg-gray-800/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="py-6">
          <div className="flex justify-center mb-4">
            <PlusCircle className="h-12 w-12 text-indigo-500" />
          </div>

          <h3 className="text-xl font-medium text-gray-300 mb-2">
            Drag & Drop Images
          </h3>
          <p className="text-gray-400 mb-6">Upload multiple images for analysis</p>

          <div className="flex justify-center">
            <label className="bg-indigo-700 text-indigo-100 hover:bg-indigo-600 px-6 py-3 rounded-xl cursor-pointer transition-colors flex items-center shadow-md">
              <PlusCircle className="h-5 w-5 mr-2" />
              Select Images
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
            </label>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-md group"
            >
              {/* Image Preview */}
              <div className="aspect-square relative">
                <img
                  src={image.previewUrl}
                  alt="Food item"
                  className="w-full h-full object-cover"
                />
                
                {/* Loading overlay */}
                {image.isAnalyzing && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-300">Analyzing...</p>
                  </div>
                )}
                
                {/* Error overlay */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-900/30 flex flex-col items-center justify-center">
                    <p className="text-sm text-red-300">{image.error}</p>
                  </div>
                )}
                
                {/* Remove button */}
                <Button
                  className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 bg-black/60 hover:bg-red-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onImageRemove(image.id)}
                  variant="destructive"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Image filename */}
              <div className="px-3 py-2 truncate text-sm text-gray-300">
                {image.file.name}
              </div>
            </div>
          ))}
          
          {/* "Add more" button/card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <PlusCircle className="h-10 w-10 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500">Add more</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUploadComponent;