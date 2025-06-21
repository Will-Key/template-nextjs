export interface News {
  id: number
  label: string
  type: string
  description: string
  content: string
  eventDate: Date
  image?: string;
}

export interface NewsFormProps {
  news: News | null
  mode: 'new' | 'edit' | 'view'
  onClose?: () => void
  onSuccess?: () => void
}