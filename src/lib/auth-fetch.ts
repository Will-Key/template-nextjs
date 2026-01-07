/**
 * Service de fetch authentifié avec gestion automatique des erreurs 401
 * Redirige automatiquement vers /login si le token est expiré ou invalide
 */

type FetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

class AuthFetchService {
  private static instance: AuthFetchService;
  private isRedirecting = false;

  private constructor() {}

  static getInstance(): AuthFetchService {
    if (!AuthFetchService.instance) {
      AuthFetchService.instance = new AuthFetchService();
    }
    return AuthFetchService.instance;
  }

  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuthRedirect = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: "include", // Toujours inclure les cookies
    });

    // Gérer l'erreur 401 (non autorisé)
    if (response.status === 401 && !skipAuthRedirect) {
      this.handleUnauthorized();
    }

    return response;
  }

  private handleUnauthorized(): void {
    // Éviter les redirections multiples
    if (this.isRedirecting) return;

    // Vérifier si on est côté client
    if (typeof window === "undefined") return;

    // Ne pas rediriger si on est déjà sur la page de login
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/staff/login"
    ) {
      return;
    }

    this.isRedirecting = true;

    // Afficher un message (optionnel - nécessite que toast soit disponible)
    console.warn("Session expirée, redirection vers la page de connexion...");

    // Rediriger vers la page de connexion
    window.location.href = "/login";
  }

  // Méthodes utilitaires
  async get(url: string, options: FetchOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: "GET" });
  }

  async post(url: string, data?: any, options: FetchOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options: FetchOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: FetchOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: "DELETE" });
  }
}

// Export de l'instance singleton
export const authFetch = AuthFetchService.getInstance();

// Export d'une fonction simplifiée pour un usage direct
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  return authFetch.fetch(url, options);
}

// Hook personnalisé pour utiliser avec les composants React
export function useAuthFetch() {
  return {
    fetch: authFetch.fetch.bind(authFetch),
    get: authFetch.get.bind(authFetch),
    post: authFetch.post.bind(authFetch),
    put: authFetch.put.bind(authFetch),
    delete: authFetch.delete.bind(authFetch),
  };
}
