export interface Challenge {
  id: number;
  userId: number;
  title: string;
  description: string;
  solution: string;
  attachmentUrl?: string;
  category: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  isResolved?: boolean;
}
const API_URL = import.meta.env.VITE_API_URL_LOCAL;

import { AuthService } from "./AuthService";

export const ChallengeService = {
  // Get latest challenges
  getLatest: async (): Promise<Challenge[]> => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/challenges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges:", response.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges");
    }

    return response.json();
},


  // Create a challenge with files (Multipart)
  createWithFiles: async (formData: FormData): Promise<Challenge> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/challenges/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur création challenge:", response.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors de la création du challenge");
    }

    return response.json();
},

  // Get challenge by category
  getByCategory: async (category: string): Promise<Challenge[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/challenges/category/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges par catégorie:", response.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges par catégorie");
    }

    return response.json();
},

  // Get challenge by difficulty
  getByDifficulty: async (difficulty: string): Promise<Challenge[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/challenges/difficulty/${difficulty}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges par difficulté:", response.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges par difficulté");
    }

    return response.json();
},

  // Get challenge by id (use AuthService.apiCall so Authorization header is included)
  getById: async (id: number): Promise<Challenge> => {
    const resp = await AuthService.apiCall(`/challenges/${id}`, { method: "GET" });
    if (!resp.ok) {
      if (resp.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      const errorData = await resp.json().catch(() => ({}));
      console.error("Erreur chargement challenge:", resp.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${resp.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement du challenge");
    }

    return resp.json();
  },

  // Validate a challenge solution
  validate: async (id: number, solution: string): Promise<boolean> => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${API_URL}/challenges/${id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: solution ? JSON.stringify({ answer: solution }) : JSON.stringify({ answer: "" }),
    });

    if (!resp.ok) {

      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la validation");
    }

    const data = await resp.json();

    return data;
  },

  // Download challenge attachment file
  downloadFile: async (id: number, filename: string): Promise<void> => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${API_URL}/challenges/${id}/download-file`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      console.error("Erreur téléchargement fichier challenge:", resp.status);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${resp.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du téléchargement du fichier du challenge");
    }
    
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
