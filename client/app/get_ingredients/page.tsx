"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Ingredient } from "../../components/IngredientsTable";
import ModeSelector from "../../components/ModeSelector";
import LiveStreamComponent from "../../components/LiveStreamComponent";
import ImageUploadComponent from "../../components/ImageUploadComponent";
import VideoUploadComponent from "../../components/VideoUploadComponent";
import { Navbar } from "@/components/navbar"; // Add navbar import

const sendLiveFrame = async (data: FormData) => {
  const res = await fetch("http://localhost:8080/upload_live_frame", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    throw new Error("Failed to upload live frame");
  }
  return res.json();
};

const uploadVideoFile = async (data: FormData) => {
  const res = await fetch("http://localhost:8080/upload_video", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    throw new Error("Failed to upload video");
  }
  return res.json();
};

const uploadImage = async (data: FormData) => {
  const res = await fetch("http://localhost:8080/upload_image", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    throw new Error("Failed to upload image");
  }
  return res.json();
};

const Home: React.FC = () => {
  const [mode, setMode] = useState<"upload" | "live" | "image" | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [detectedIngredients, setDetectedIngredients] = useState<
    Ingredient[] | null
  >(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  // Add state for navbar active page
  const [activePage, setActivePage] = useState("upload");

  // Refs for video element, hidden canvas and file input
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Image upload handler
  const handleImageUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fileInputRef.current && fileInputRef.current.files?.length) {
      const file = fileInputRef.current.files[0];
      // Preview the image
      setUploadedImage(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("image", file);
      imageUploadMutation.mutate(formData);
    }
  };

  // Video upload handler
  const handleVideoUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fileInputRef.current && fileInputRef.current.files?.length) {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("video", file);
      videoUploadMutation.mutate(formData);
    }
  };

  // Toggle streaming on/off
  const toggleStreaming = () => {
    if (!isStreaming) {
      // Only start camera when streaming begins
      startCamera();
    } else {
      // Stop the stream when toggled off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }
    setIsStreaming((prev) => !prev);
  };

  // React Query mutations
  const imageUploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadImage(formData),
    onSuccess: (data) => {
      if (data && data.ingredients) {
        setDetectedIngredients(data.ingredients);
      }
    },
  });

  const liveFrameMutation = useMutation({
    mutationFn: (formData: FormData) => sendLiveFrame(formData),
    onSuccess: (data) => {
      setLastResponse(data);
      if (data && data.ingredients) {
        setDetectedIngredients(data.ingredients);
      }
    },
  });

  const videoUploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadVideoFile(formData),
  });

  // Get available cameras when component loads
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting camera devices:", error);
      }
    };

    getAvailableCameras();
  }, []);

  // Start camera with selected device
  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera", error);
    }
  };

  // For live streaming: capture frame every second when streaming
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (
      isStreaming &&
      mode === "live" &&
      videoRef.current &&
      canvasRef.current
    ) {
      intervalId = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const video = videoRef.current;

        if (video.videoWidth === 0) return; // Skip if video not ready

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to a Blob (JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append("frame", blob, "frame.jpg");
              liveFrameMutation.mutate(formData);
            }
          },
          "image/jpeg",
          0.8
        );
      }, 1000); // Every 1 second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStreaming, mode]);

  // Clean up stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Handle camera stream cleanup when mode changes
  useEffect(() => {
    if (mode !== "live") {
      setIsStreaming(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Add navbar at the top */}
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      {/* Keep the original content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-center text-white">
              Get Your Ingredients
            </h1>
          </div>

          <div className="p-6">
            {/* Mode Selector Component */}
            <ModeSelector
              mode={mode}
              setMode={setMode}
              setIsStreaming={setIsStreaming}
            />

            {/* Image Upload Component */}
            {mode === "image" && (
              <ImageUploadComponent
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                uploadedImage={uploadedImage}
                detectedIngredients={detectedIngredients}
                imageUploadMutation={imageUploadMutation}
                handleImageUpload={handleImageUpload}
                setUploadedImage={setUploadedImage}
              />
            )}

            {/* Video Upload Component */}
            {mode === "upload" && (
              <VideoUploadComponent
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                videoUploadMutation={videoUploadMutation}
                handleVideoUpload={handleVideoUpload}
              />
            )}

            {/* Live Stream Component */}
            {mode === "live" && (
              <LiveStreamComponent
                isStreaming={isStreaming}
                availableCameras={availableCameras}
                selectedCamera={selectedCamera}
                detectedIngredients={detectedIngredients}
                streamRef={streamRef}
                videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
                liveFrameMutation={liveFrameMutation}
                toggleStreaming={toggleStreaming}
                setSelectedCamera={setSelectedCamera}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
