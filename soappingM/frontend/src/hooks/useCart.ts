// frontend/src/hooks/useCart.ts
import { useContext } from "react";
import { CartContext } from "../context/CartContext"; // CartContext를 직접 불러옵니다.

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
