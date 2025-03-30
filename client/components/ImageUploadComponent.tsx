import React, { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import IngredientsTable, { Ingredient } from "./IngredientsTable";
// Add setUploadedImage to the props interface
interface ImageUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadedImage: string | null;
  detectedIngredients: Ingredient[] | null;
  imageUploadMutation: UseMutationResult<any, Error, FormData>;
  handleImageUpload: (e: React.FormEvent<HTMLFormElement>) => void;
  setUploadedImage: (image: string | null) => void; // Add this line
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({
  fileInputRef,
  uploadedImage,
  detectedIngredients,
  imageUploadMutation,
  handleImageUpload,
  setUploadedImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection change
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];
  //     const imageUrl = URL.createObjectURL(file);
  //     // We'll use the handleImageUpload function passed from the parent
  //     // But we need to create and submit the form programmatically
  //     const formData = new FormData();
  //     formData.append("image", file);

  //     // Create a synthetic form event
  //     const syntheticEvent = {
  //       preventDefault: () => {},
  //       currentTarget: {
  //         elements: {
  //           image: { files: [file] }
  //         }
  //       }
  //     } as unknown as React.FormEvent<HTMLFormElement>;

  //     handleImageUpload(syntheticEvent);
  //   }
  // };
  // Update handleFileChange function:
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      // Set the uploaded image preview
      setUploadedImage(imageUrl);

      // Create form data for upload
      const formData = new FormData();
      formData.append("image", file);

      // Trigger the mutation directly
      imageUploadMutation.mutate(formData);
    }
  };
  // Handle drag events for the drop zone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Update the handleDrop function:
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Only accept image files
      if (file.type.startsWith("image/")) {
        if (fileInputRef.current) {
          // Create a DataTransfer object to set files on the input element
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;

          // Set the uploaded image preview
          const imageUrl = URL.createObjectURL(file);
          setUploadedImage(imageUrl);

          // Create form data for upload
          const formData = new FormData();
          formData.append("image", file);

          // Trigger the mutation directly
          imageUploadMutation.mutate(formData);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {!uploadedImage ? (
        <div
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-900/20"
              : "border-gray-600 bg-gray-750"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <form
            onSubmit={handleImageUpload}
            className="flex flex-col items-center"
          >
            <div className="py-8">
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-medium text-gray-300 mb-2">
                Drag & Drop Image
              </h3>
              <p className="text-gray-400 mb-6">
                or click to select file from your computer
              </p>

              <div className="flex justify-center">
                <label className="bg-indigo-700 text-indigo-100 hover:bg-indigo-600 px-6 py-3 rounded-xl cursor-pointer transition-colors flex items-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Select Image
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-5">
                Supported formats: JPG, PNG
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl mb-4">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-auto max-h-[500px] object-contain"
              />

              {/* Image info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-indigo-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-100 font-medium truncate max-w-xs">
                    {fileInputRef.current?.files?.[0]?.name || "Uploaded image"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Clear the image preview
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    // Reset the uploaded image in the parent component
                    setUploadedImage(null);
                  }}
                  className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm text-white p-1 rounded-full text-xs flex items-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
            </div>

            {/* Upload a different image button */}
            <div className="bg-gray-750 px-4 py-3 border-t border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {fileInputRef.current?.files?.[0] &&
                  (fileInputRef.current.files[0].size / (1024 * 1024)).toFixed(
                    2
                  ) + " MB"}
              </span>

              <label className="bg-indigo-600/20 text-indigo-300 hover:bg-indigo-700/30 px-3 py-1 rounded-lg cursor-pointer transition-colors text-xs flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Another
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // Clear current image first
                    setUploadedImage(null);
                    // Then handle the new file selection
                    handleFileChange(e);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Status messages */}
      {uploadedImage && imageUploadMutation.isError && (
        <div className="w-full mt-4 p-4 bg-red-900/30 text-red-300 rounded-xl border border-red-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Error analyzing image. Please try again with a different file.
          </span>
        </div>
      )}

      {/* Loading state */}
      {uploadedImage && imageUploadMutation.isPending && (
        <div className="w-full mt-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex space-x-1">
              <div
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p className="text-gray-300 font-medium">
              Analyzing ingredients in your image...
            </p>
          </div>
        </div>
      )}

      {/* Ingredients table */}
      {uploadedImage &&
        detectedIngredients &&
        !imageUploadMutation.isPending && (
          <IngredientsTable
            ingredients={detectedIngredients}
            isLoading={false}
          />
        )}
    </div>
  );
};

export default ImageUploadComponent;
