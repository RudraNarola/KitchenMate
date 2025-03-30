import React, { useState, useRef, useEffect } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import IngredientsTable, { Ingredient } from "./IngredientsTable";

interface VideoUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  videoUploadMutation: UseMutationResult<any, Error, FormData>;
  handleVideoUpload: (e: React.FormEvent<HTMLFormElement>) => void;
}

const VideoUploadComponent: React.FC<VideoUploadProps> = ({
  fileInputRef,
  videoUploadMutation,
  handleVideoUpload,
}) => {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [detectedIngredients, setDetectedIngredients] = useState<
    Ingredient[] | null
  >(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle file selection change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);

      // Reset any existing processing state
      setIsProcessing(false);
      setProcessingProgress(0);
      setCurrentTime(0);
      setDetectedIngredients(null);

      // If we were processing a previous video, clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Only accept video files
      if (file.type.startsWith("video/")) {
        if (fileInputRef.current) {
          // Create a DataTransfer object to set files on the input element
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;

          // Create preview
          const videoUrl = URL.createObjectURL(file);
          setVideoPreview(videoUrl);

          // Reset processing state
          setIsProcessing(false);
          setProcessingProgress(0);
          setCurrentTime(0);
          setDetectedIngredients(null);

          // Clear any existing interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    }
  };

  // Play/pause the preview video
  const toggleVideoPlay = () => {
    if (previewVideoRef.current) {
      if (previewVideoRef.current.paused) {
        previewVideoRef.current.play();
      } else {
        previewVideoRef.current.pause();
      }
    }
  };

  // When video metadata loads, get duration
  const handleVideoMetadata = () => {
    if (previewVideoRef.current) {
      setDuration(previewVideoRef.current.duration);
    }
  };

  // Process video frame by frame
  const processVideo = () => {
    if (!previewVideoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const video = previewVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Reset video to beginning
    video.currentTime = 0;
    video.pause();

    // Set up a function to capture and send frames
    const captureAndSendFrame = () => {
      if (!video || !canvas || !ctx) return;

      // If we're at the end of the video, stop processing
      if (video.currentTime >= video.duration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsProcessing(false);
        setProcessingProgress(100);
        return;
      }

      // Update canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and send to server
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("frame", blob, "frame.jpg");

            // Send the frame to the server with the same endpoint as live frames
            fetch("http://localhost:8080/upload_live_frame", {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data && data.ingredients) {
                  setDetectedIngredients(data.ingredients);
                }
              })
              .catch((error) => {
                console.error("Error sending frame:", error);
              });
          }
        },
        "image/jpeg",
        0.8
      );

      // Calculate progress
      const progress = Math.min(
        (video.currentTime / video.duration) * 100,
        100
      );
      setProcessingProgress(progress);
      setCurrentTime(video.currentTime);

      // Move to next second of video
      video.currentTime = Math.min(video.currentTime + 1, video.duration);
    };

    // Capture first frame immediately
    captureAndSendFrame();

    // Setup interval to handle seeking and capturing
    intervalRef.current = setInterval(() => {
      // Once seeking is complete, capture the frame
      if (!video.seeking) {
        captureAndSendFrame();
      }
    }, 1000);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
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
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col items-center"
        >
          <div className="mb-8 w-full">
            {!videoPreview ? (
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
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  Drag & Drop Video
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Select Video File
                    <input
                      type="file"
                      accept="video/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <p className="text-xs text-gray-500 mt-5">
                  Supported formats: MP4, MOV
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden shadow-xl border border-gray-700 mb-4 bg-gray-800">
                <div className="aspect-video relative group">
                  <video
                    ref={previewVideoRef}
                    src={videoPreview}
                    className="w-full h-full object-cover"
                    onClick={toggleVideoPlay}
                    onLoadedMetadata={handleVideoMetadata}
                  />

                  {/* Video controls overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4"
                    onClick={toggleVideoPlay}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoPlay();
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                      </button>
                      <div className="text-sm font-medium text-white">
                        {fileInputRef.current?.files?.[0]?.name || "Preview"}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full text-xs flex items-center transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoPreview(null);
                        setDetectedIngredients(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        if (intervalRef.current) {
                          clearInterval(intervalRef.current);
                          intervalRef.current = null;
                        }
                        setIsProcessing(false);
                      }}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* File name and size */}
                <div className="bg-gray-750 px-4 py-3 border-t border-gray-700 flex justify-between items-center">
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-300 font-medium truncate max-w-xs">
                      {fileInputRef.current?.files?.[0]?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {fileInputRef.current?.files?.[0] &&
                      (
                        fileInputRef.current.files[0].size /
                        (1024 * 1024)
                      ).toFixed(2) + " MB"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Processing progress bar */}
          {isProcessing && (
            <div className="w-full mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Processing: {Math.round(processingProgress)}%</span>
                <span>
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="button"
            className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center shadow-lg ${
              videoPreview && !isProcessing
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!videoPreview || isProcessing}
            onClick={processVideo}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Video...
              </>
            ) : (
              <>
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Analyze Video
              </>
            )}
          </button>
        </form>
      </div>

      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Status messages and results */}
      {isProcessing && (
        <div className="w-full mt-4 p-4 bg-indigo-900/20 text-indigo-200 rounded-xl border border-indigo-700 flex items-center">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Processing video frame by frame. Please wait...</span>
        </div>
      )}

      {processingProgress === 100 && !isProcessing && (
        <div className="w-full mt-4 p-4 bg-green-900/30 text-green-300 rounded-xl border border-green-700 flex items-center">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Video analysis complete!</span>
        </div>
      )}

      {/* Show detected ingredients */}
      {detectedIngredients && (
        <div className="w-full mt-6">
          <IngredientsTable
            ingredients={detectedIngredients}
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
};

export default VideoUploadComponent;
