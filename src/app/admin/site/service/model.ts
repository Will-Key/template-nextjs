export interface Service {
  id: number;
  label: string;
  description: string;
  content: string[]
  image?: string;
}

export interface ServiceFormProps {
  service: Service | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface ServiceListProps {
  services: Service[]
  loading: boolean
  error: Error | null
  onEdit: (service: Service) => void
  onSuccess?: () => void
  loadData: () => void
}