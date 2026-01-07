import { CartProvider } from "@/lib/cart-context";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
