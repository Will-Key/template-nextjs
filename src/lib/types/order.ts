import {
  Restaurant,
  Staff,
  Table,
  MenuCategory,
  MenuItem,
  Customer,
  Order,
  OrderItem,
  Notification,
  StaffRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TableStatus,
  MenuItemStatus,
  NotificationType,
} from "@prisma/client";

// Re-export des types Prisma
export type {
  Restaurant,
  Staff,
  Table,
  MenuCategory,
  MenuItem,
  Customer,
  Order,
  OrderItem,
  Notification,
};

export {
  StaffRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TableStatus,
  MenuItemStatus,
  NotificationType,
};

// Types étendus avec relations
export type MenuItemWithCategory = MenuItem & {
  category: MenuCategory;
};

export type MenuCategoryWithItems = MenuCategory & {
  menuItems: MenuItem[];
};

export type OrderItemWithMenuItem = OrderItem & {
  menuItem: MenuItem;
};

export type OrderWithDetails = Order & {
  items: OrderItemWithMenuItem[];
  table: Table;
  customer: Customer | null;
  handledBy: Staff | null;
  restaurant: Restaurant;
};

export type TableWithWaiter = Table & {
  assignedWaiter: Staff | null;
};

export type RestaurantWithMenu = Restaurant & {
  categories: MenuCategoryWithItems[];
  tables: Table[];
};

// DTOs pour les requêtes
export type CreateOrderDTO = {
  restaurantId: string;
  tableId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
};

export type UpdateOrderStatusDTO = {
  status: OrderStatus;
  handledById?: string;
};

export type CreateRestaurantDTO = {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency?: string;
  taxRate?: number;
};

export type CreateMenuCategoryDTO = {
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder?: number;
};

export type CreateMenuItemDTO = {
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  prepTime?: number;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
};

export type CreateTableDTO = {
  restaurantId: string;
  number: number;
  name?: string;
  capacity?: number;
  assignedWaiterId?: string;
};

export type CreateStaffDTO = {
  restaurantId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: StaffRole;
};

// Type pour le panier côté client
export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
};

export type Cart = {
  restaurantId: string;
  tableId: string;
  items: CartItem[];
};
