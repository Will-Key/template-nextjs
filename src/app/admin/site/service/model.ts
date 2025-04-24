export interface Service {
  id: number;
  label: string;
  description: string;
  image?: string;
}

export interface ServiceFormProps {
  service: Service | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface ServiceListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onSuccess?: () => void
}