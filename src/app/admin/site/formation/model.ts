
export interface Formation {
  id: string
  label: string
  description: string
  days: number
  maxParticipants: number
  amount: number
  modules: string[]
}

export interface FormationFormProps {
  formation: Formation | null
  mode: 'new' | 'edit' | 'view'
  onClose?: () => void
  onSuccess?: () => void
}
