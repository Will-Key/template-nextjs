import { Docs, News } from "@prisma/client"

// Définir les types pour notre API
export type Formation = {
  id: string
  label: string
  description: string
  days: number
  maxParticipants: number
  amount: number
  modules: string[]
  status: "published" | "draft" | "archived"
  createdAt: string
}

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "manager"
  status: "active" | "inactive"
  lastLogin: string
  avatar?: string
}

// Classe de base pour les services API
export abstract class BaseApiService<T> {
  protected baseUrl: string

  constructor(endpoint: string) {
    this.baseUrl = `/api/${endpoint}`
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await fetch(this.baseUrl)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la récupération des données:`, error)
      throw error
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'élément ${id}:`, error)
      throw error
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la création:`, error)
      throw error
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${id}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ${id}:`, error)
      throw error
    }
  }
}

// Service pour les formations
export class FormationsService extends BaseApiService<Formation> {
  constructor() {
    super('formations')
  }
  
  // Méthodes spécifiques aux formations
  async getByStatus(status: Formation['status']): Promise<Formation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${status}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la récupération des formations par statut ${status}:`, error)
      throw error
    }
  }
}

// Service pour les utilisateurs
export class UsersService extends BaseApiService<User> {
  constructor() {
    super('users')
  }
  
  // Méthodes spécifiques aux utilisateurs
  async getByRole(role: User['role']): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/role/${role}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs par rôle ${role}:`, error)
      throw error
    }
  }
}

export class DocsService extends BaseApiService<Docs> {
  constructor() {
    super('docs')
  }
}

export class NewsService extends BaseApiService<News> {
  constructor() {
    super('news')
  }
}

// Export des instances des services
export const formationsService = new FormationsService()
export const usersService = new UsersService()
export const newsServices = new NewsService()
export const docsService = new DocsService()