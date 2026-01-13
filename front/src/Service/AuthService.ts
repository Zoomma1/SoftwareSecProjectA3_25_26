export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  fullname: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const AuthService = {
  register: async (payload: RegisterPayload) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

  login: async (payload: LoginPayload) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la connexion");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Helper to make authenticated requests (acts as an interceptor)
  apiCall: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers: any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      AuthService.logout();
    }

    return response;
  },
};
