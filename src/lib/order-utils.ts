import { OrderStatus } from "@prisma/client";

/**
 * Génère un numéro de commande unique
 * Format: CMD-YYYYMMDD-XXX (ex: CMD-20260107-001)
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const sequence = String(sequenceNumber).padStart(3, "0");
  return `CMD-${dateStr}-${sequence}`;
}

/**
 * Calcule le sous-total d'une commande
 */
export function calculateSubtotal(
  items: { unitPrice: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

/**
 * Calcule le montant des taxes
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100));
}

/**
 * Calcule le total d'une commande
 */
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}

/**
 * Estime le temps de préparation total basé sur les articles
 */
export function estimatePrepTime(
  items: { prepTime?: number | null; quantity: number }[]
): number {
  // On prend le temps max + un peu de temps supplémentaire par article
  const maxPrepTime = Math.max(
    ...items.map((item) => item.prepTime ?? 10)
  );
  const additionalTime = Math.min(items.length * 2, 15); // Max 15 min supplémentaires
  return maxPrepTime + additionalTime;
}

/**
 * Retourne le libellé français d'un statut de commande
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    ready: "Prête",
    served: "Servie",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  return labels[status];
}

/**
 * Retourne la couleur associée à un statut de commande
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    served: "bg-purple-100 text-purple-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status];
}

/**
 * Vérifie si une transition de statut est valide
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["served", "cancelled"],
    served: ["completed"],
    completed: [],
    cancelled: [],
  };
  return validTransitions[currentStatus].includes(newStatus);
}

/**
 * Formate un prix en FCFA
 */
export function formatPrice(amount: number, currency: string = "XOF"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Génère l'URL du QR code pour une table
 */
export function generateTableQRUrl(
  baseUrl: string,
  restaurantSlug: string,
  tableNumber: number
): string {
  return `${baseUrl}/r/${restaurantSlug}/table/${tableNumber}`;
}
