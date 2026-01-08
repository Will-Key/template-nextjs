// Classe de base pour les services API
// Utilisez cette classe pour créer des services API réutilisables

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

// Exemple d'utilisation:
// 
// interface Post {
//   id: string
//   title: string
//   content: string
// }
// 
// class PostsService extends BaseApiService<Post> {
//   constructor() {
//     super('posts')
//   }
// }
// 
// export const postsService = new PostsService()
