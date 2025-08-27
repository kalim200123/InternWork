import axios from "axios";
import type { ReactNode } from "react"; // 👈 1. import type 으로 수정
import { createContext, useEffect, useState } from "react";

interface CartContextType {
  cartCount: number;
  fetchCartCount: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const response = await axios.get("http://localhost:3001/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(response.data.length);
      } catch (error) {
        console.error("장바구니 수량 로딩 실패", error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  // 컴포넌트가 처음 마운트될 때와 토큰이 변경될 때 수량을 가져옵니다.
  useEffect(() => {
    fetchCartCount();

    // 로그인/로그아웃 시 이벤트를 감지하여 수량을 다시 가져오는 로직 (선택적 고급 기능)
    const handleStorageChange = () => {
      fetchCartCount();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <CartContext.Provider value={{ cartCount, fetchCartCount }}>{children}</CartContext.Provider>;
};
