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

export const ChallengeService = {
  // Get latest challenges
  getLatest: async (): Promise<Challenge[]> => {
      const response = await fetch(`${API_URL}/challenges/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges");
    }

    return response.json();
},


  // Create a challenge with files (Multipart)
  createWithFiles: async (formData: FormData): Promise<Challenge> => {
    const response = await fetch(`${API_URL}/challenges/upload`, {
      method: "POST",
      headers: {
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur création challenge:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors de la création du challenge");
    }

    return response.json();
},

  // Get challenge by category
  getByCategory: async (category: string): Promise<Challenge[]> => {
    const response = await fetch(`${API_URL}/challenges/category/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges par catégorie:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges par catégorie");
    }

    return response.json();
},

  // Get challenge by difficulty
  getByDifficulty: async (difficulty: string): Promise<Challenge[]> => {
    const response = await fetch(`${API_URL}/challenges/difficulty/${difficulty}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur chargement challenges par difficulté:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors du chargement des challenges par difficulté");
    }

    return response.json();
},

};
