import React from "react";

interface ModeSelectorProps {
  mode: "upload" | "live" | "image" | null;
  setMode: (mode: "upload" | "live" | "image" | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  setMode,
  setIsStreaming,
}) => {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <button
        className={`px-6 py-3 rounded-xl font-medium transition-all ${
          mode === "image"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
        onClick={() => {
          setIsStreaming(false);
          setMode("image");
        }}
      >
        <span className="flex items-center">
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
          Upload Image
        </span>
      </button>
      <button
        className={`px-6 py-3 rounded-xl font-medium transition-all ${
          mode === "upload"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
        onClick={() => {
          setIsStreaming(false);
          setMode("upload");
        }}
      >
        <span className="flex items-center">
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload Video
        </span>
      </button>
      <button
        className={`px-6 py-3 rounded-xl font-medium transition-all ${
          mode === "live"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
        onClick={() => setMode("live")}
      >
        <span className="flex items-center">
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
          Live Stream
        </span>
      </button>
    </div>
  );
};

export default ModeSelector;