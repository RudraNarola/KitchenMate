import { useState, useCallback } from "react";
import axios from "axios";

export type DataItem = {
  date: string;
  ingredient: string;
  consumption: number;
  type: "daily" | "monthly";
  high_risk: boolean;
};

export default function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
        setError("");
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("date", new Date().toISOString().split("T")[0]);
    if (season) formData.append("season", season);

    try {
      const response = await axios.post(
        "http://localhost:8080/upload_csv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setData(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, [file, season]);

  return {
    file,
    data,
    season,
    loading,
    error,
    setFile,
    setSeason,
    handleFileChange,
    handleUpload,
  };
}