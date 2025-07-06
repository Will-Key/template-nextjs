import { News } from "@prisma/client"


export interface NewsFormProps {
  news: News | null
  mode: 'new' | 'edit' | 'view'
  onClose?: () => void
  onSuccess?: () => void
}
export interface NewsListProps {
  news: News[]
  loading: boolean
  error: Error | null
  onEdit: (service: News) => void
  onSuccess?: () => void
  loadData: () => void
  emptyMessage: string
  errorMessage: string
}