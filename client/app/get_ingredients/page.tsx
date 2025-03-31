"use client";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Ingredient } from "@/components/IngredientsTable";
import MultipleImageUploadComponent, { UploadedImage } from "@/components/MultipleImageUploadComponent";
import IngredientSummaryCard from "@/components/IngredientSummaryCard";
import LiveStreamComponent from "@/components/LiveStreamComponent";
import VideoUploadComponent from "@/components/VideoUploadComponent";
import { UploadCloud, Video, Camera } from "lucide-react";

// API calls
const uploadImage = async (data: FormData) => {
  try {
    const res = await fetch("http://localhost:8080/upload_image", {
      method: "POST",
      body: data,
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error response:", errorText);
      throw new Error(`Failed to upload image: ${res.status} ${res.statusText}`);
    }
    
    let result = await res.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Image upload network error:", error);
    throw error;
  }
};

// API call for live stream frames
const uploadLiveFrame = async (data: FormData) => {
  try {
    const res = await fetch("http://localhost:8080/upload_live_frame", {
      method: "POST",
      body: data,
    });
    
    if (!res.ok) {
      throw new Error(`Failed to analyze frame: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Live frame upload error:", error);
    throw error;
  }
};

// API call for video upload
const uploadVideo = async (data: FormData) => {
  try {
    const res = await fetch("http://localhost:8080/upload_video", {
      method: "POST",
      body: data,
    });
    
    if (!res.ok) {
      throw new Error(`Failed to upload video: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Video upload error:", error);
    throw error;
  }
};

export default function IngredientDetectionPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeTab, setActiveTab] = useState("images");
  const [activePage, setActivePage] = useState("get_ingredients");
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to store ingredients in localStorage
  const storeIngredients = (ingredients: Ingredient[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('detectedIngredients', JSON.stringify(ingredients));
    }
  };
  
  // Live streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [liveIngredients, setLiveIngredients] = useState<Ingredient[] | null>(null);
  
  // Refs for video streaming
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>;
  const canvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>;
  
  // Ref for video upload
  const videoFileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  
  // Mutation for image upload and analysis
  const imageUploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data, variables) => {
      const fileInFormData = variables.get('image') as File;
      
      if (!fileInFormData) {
        console.error("Cannot find the file in FormData");
        return;
      }
      
      setUploadedImages(prev => prev.map(img => {
        if (img.file.name === fileInFormData.name && 
            img.file.size === fileInFormData.size && 
            img.file.lastModified === fileInFormData.lastModified) {
          return {
            ...img,
            ingredients: data.ingredients || [],
            isAnalyzing: false
          };
        }
        return img;
      }));

      // Store ingredients in localStorage
      if (data.ingredients) {
        storeIngredients(data.ingredients);
      }
    },
    onError: (error, variables) => {
      // Error handling for image upload
      const fileInFormData = variables.get('image') as File;
      
      if (!fileInFormData) {
        console.error("Cannot find the file in FormData");
        
        setUploadedImages(prev => 
          prev.map(img => img.isAnalyzing ? 
            { ...img, isAnalyzing: false, error: "Failed to analyze image" } : img
          )
        );
        return;
      }
      
      setUploadedImages(prev => prev.map(img => {
        if (img.file.name === fileInFormData.name && 
            img.file.size === fileInFormData.size && 
            img.file.lastModified === fileInFormData.lastModified) {
          return {
            ...img,
            isAnalyzing: false,
            error: "Failed to analyze image"
          };
        }
        return img;
      }));
      console.error("Error detecting ingredients:", error);
    }
  });
  
  // Mutation for live frame analysis
  const liveFrameMutation = useMutation({
    mutationFn: uploadLiveFrame,
    onSuccess: (data) => {
      if (data && data.ingredients) {
        setLiveIngredients(data.ingredients);
        storeIngredients(data.ingredients);
      }
    },
    onError: (error) => {
      console.error("Live frame analysis error:", error);
    }
  });
  
  // Mutation for video upload
  const videoUploadMutation = useMutation({
    mutationFn: uploadVideo,
    onSuccess: (data) => {
      console.log("Video analysis complete:", data);
      if (data && data.ingredients) {
        storeIngredients(data.ingredients);
      }
    },
    onError: (error) => {
      console.error("Video upload error:", error);
    }
  });
  
  // Get available cameras when camera tab is active
  useEffect(() => {
    if (activeTab === "camera") {
      const getAvailableCameras = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === "videoinput");
          setAvailableCameras(videoDevices);
          if (videoDevices.length > 0 && !selectedCamera) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        } catch (err) {
          console.error("Error loading cameras:", err);
        }
      };
      
      getAvailableCameras();
    }
    
    // Clean up stream when tab changes
    return () => {
      if (activeTab !== "camera" && isStreaming) {
        // Stop streaming when leaving camera tab
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsStreaming(false);
      }
    };
  }, [activeTab]);
  
  // For live streaming: capture frame every second when streaming
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isStreaming && activeTab === "camera" && videoRef.current && canvasRef.current) {
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
  }, [isStreaming, activeTab]);
  
  // Toggle streaming on/off
  const toggleStreaming = async () => {
    if (isStreaming) {
      // Stop streaming
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        streamRef.current = null;
      }
      setIsStreaming(false);
    } else {
      // Start streaming
      await startCamera();
      setIsStreaming(true);
    }
  };
  
  // Start camera with selected device
  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
  
  // Handle video upload submission
  const handleVideoUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (videoFileInputRef.current?.files && videoFileInputRef.current.files.length > 0) {
      const file = videoFileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('video', file);
      
      videoUploadMutation.mutate(formData);
    }
  };
  
  const handleImagesSelected = (files: File[]) => {
    const newImages: UploadedImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      ingredients: null,
      isAnalyzing: true
    }));
    
    setUploadedImages(prev => [...prev, ...newImages]);
    
    // Process each new image
    newImages.forEach(img => {
      const formData = new FormData();
      formData.append("image", img.file);
      
      console.log("Uploading file:", img.file.name, "size:", img.file.size);
      
      imageUploadMutation.mutate(formData);
    });
  };
  
  const handleImageRemove = (id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };
  
  // Clean up stream and intervals when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage={activePage} onPageChange={setActivePage} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Ingredient Detection
          </h1>
          <p className="text-gray-400 mt-2">
            Upload food images to detect ingredients and their health status
          </p>
        </div>

        {/* Mode selection tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-3 bg-gray-800/50 rounded-xl p-1">
            <TabsTrigger 
              value="images" 
              className="data-[state=active]:bg-indigo-700 text-white"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:bg-indigo-700 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger 
              value="camera" 
              className="data-[state=active]:bg-indigo-700 text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Live Camera
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="pt-4">
            {/* Image Upload Area */}
            <Card className="bg-gray-900 border-gray-800 shadow-xl mb-8">
              <CardContent className="p-6">
                <MultipleImageUploadComponent 
                  uploadedImages={uploadedImages}
                  onImagesSelected={handleImagesSelected}
                  onImageRemove={handleImageRemove}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
            
            {/* Results Area - Only show if we have images with results */}
            {uploadedImages.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-800 pb-2">
                  Analysis Results
                </h2>
                
                {uploadedImages.map(img => (
                  <IngredientSummaryCard key={img.id} image={img} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="video" className="pt-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                {/* Add VideoUploadComponent here */}
                <VideoUploadComponent 
                  fileInputRef={videoFileInputRef}
                  videoUploadMutation={videoUploadMutation}
                  handleVideoUpload={handleVideoUpload}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="camera" className="pt-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                {/* LiveStreamComponent integration */}
                <LiveStreamComponent
                  isStreaming={isStreaming}
                  availableCameras={availableCameras}
                  selectedCamera={selectedCamera}
                  detectedIngredients={liveIngredients}
                  streamRef={streamRef}
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  liveFrameMutation={liveFrameMutation}
                  toggleStreaming={toggleStreaming}
                  setSelectedCamera={setSelectedCamera}
                />

                {/* Hidden canvas for frame capture */}
                <canvas 
                  ref={canvasRef} 
                  style={{ display: 'none' }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}