import { User } from "@prisma/client"

export interface UserFormProps {
  user: User | null
  mode: 'new' | 'edit' | 'view'
  onClose?: () => void
  onSuccess?: () => void
}