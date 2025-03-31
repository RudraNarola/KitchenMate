import React, { useRef, useEffect } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import IngredientsTable, { Ingredient } from "./IngredientsTable";

interface LiveStreamProps {
  isStreaming: boolean;
  availableCameras: MediaDeviceInfo[];
  selectedCamera: string;
  detectedIngredients: Ingredient[] | null;
  streamRef: React.MutableRefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  liveFrameMutation: UseMutationResult<any, Error, FormData>;
  toggleStreaming: () => void;
  setSelectedCamera: (cameraId: string) => void;
}

const LiveStreamComponent: React.FC<LiveStreamProps> = ({
  isStreaming,
  availableCameras,
  selectedCamera,
  detectedIngredients,
  streamRef,
  videoRef,
  canvasRef,
  liveFrameMutation,
  toggleStreaming,
  setSelectedCamera,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Camera selection dropdown */}
      {availableCameras.length > 1 && (
        <div className="w-full max-w-2xl mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
            disabled={isStreaming}
          >
            {availableCameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
          {isStreaming && (
            <p className="text-xs text-gray-400 mt-1">
              Stop streaming to change camera
            </p>
          )}
        </div>
      )}

      <div className="relative w-full max-w-2xl mx-auto mb-6 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
        {!isStreaming && !streamRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-850 z-10">
            <div className="text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-3 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400">Click "Start Stream" to begin</p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto bg-gray-850 aspect-video"
        />

        {/* Hidden canvas used to capture a frame */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={toggleStreaming}
          className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center shadow-lg ${
            isStreaming
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {isStreaming ? (
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
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              Stop Stream
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
              Start Stream
            </>
          )}
        </button>
      </div>

      {liveFrameMutation.isError && (
        <div className="p-3 mb-4 bg-red-900/30 text-red-300 rounded-xl border border-red-700">
          Error connecting to server. Please check your connection.
        </div>
      )}
{isStreaming && (
  <div className="w-full max-w-2xl mx-auto">
    <IngredientsTable
      ingredients={detectedIngredients}
      isLoading={liveFrameMutation.isPending && !detectedIngredients}
    />
  </div>
)}
      {!isStreaming && detectedIngredients && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-gray-750 rounded-xl border border-gray-600">
          <p className="text-center text-gray-400">
            Start streaming to see live ingredient detection
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveStreamComponent;
