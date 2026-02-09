import axios from "axios";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const photosApi = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/photos");
      return response.data;
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
    }
  },

  getAllAdmin: async () => {
    try {
      const response = await axiosInstance.get("/photos/admin/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching photos (admin):", error);
      return [];
    }
  },

  create: async (photo: { title: string; alt: string; imageUrl: string }) => {
    try {
      const response = await axiosInstance.post("/photos/admin", photo);
      return response.data;
    } catch (error) {
      console.error("Error creating photo:", error);
      throw error;
    }
  },

  upload: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("accessToken");

      try {
        const response = await axiosInstance.post(
          "/photos/admin/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          const fallbackResponse = await axiosInstance.post(
            "/api/photos/admin/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            },
          );
          return fallbackResponse.data;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  },

  update: async (id: string, photo: any) => {
    try {
      const response = await axiosInstance.patch(`/photos/admin/${id}`, photo);
      return response.data;
    } catch (error) {
      console.error("Error updating photo:", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/photos/admin/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting photo:", error);
      throw error;
    }
  },

  toggleActive: async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/photos/admin/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error("Error toggling photo:", error);
      throw error;
    }
  },

  reorder: async (photos: Array<{ id: string; order: number }>) => {
    try {
      const response = await axiosInstance.post(
        "/photos/admin/reorder",
        photos,
      );
      return response.data;
    } catch (error) {
      console.error("Error reordering photos:", error);
      throw error;
    }
  },
};
