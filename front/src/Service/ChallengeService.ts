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
      console.error("Erreur inscription:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors de l'inscription");
    }

    return response.json();
},


  // Create a challenge with files (Multipart)
  createWithFiles: async (formData: FormData): Promise<Challenge> => {
    const response = await fetch(`${API_URL}/challenges/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur inscription:", response.status, errorData);
      if (Object.keys(errorData).length === 0) {
        throw new Error(`Erreur serveur (${response.status}). Vérifiez que le backend est lancé.`);
      }
      throw new Error(errorData.message || "Une erreur est survenue lors de l'inscription");
    }

    return response.json();
},

};
