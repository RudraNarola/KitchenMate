import axios from "axios";

export const handleUpload = async (
  file: File | null,
  season: string,
  setData: (data: unknown) => void
) => {
  if (!file) {
    console.error("No file selected");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("date", new Date().toISOString().split("T")[0]); // Mandatory field
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
  } catch (error) {
    console.error("Error uploading file", error);
  }
};
