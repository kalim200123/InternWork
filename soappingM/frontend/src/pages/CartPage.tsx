// frontend/src/pages/CartPage.tsx
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types";

// --- 타입 정의 ---
interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

// --- Styled-Components ---
const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 12px 8px;
    border-bottom: 1px solid #eee;
    text-align: center;
    vertical-align: middle;
  }

  th:nth-child(1),
  td:nth-child(1) {
    text-align: left;
    width: 60%;
  }

  img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    background: #f6f6f6;
    border-radius: 6px;
    margin-right: 15px;
  }

  input[type="number"] {
    width: 64px;
    padding: 6px;
    text-align: center;
  }

  button {
    background: none;
    border: 1px solid #ddd;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
`;

const FooterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;

  .btn {
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .btn-clear {
    background: #f8f9fa;
    color: #555;
    border: 1px solid #ddd;

    &:hover {
      background: #e9ecef;
      color: #333;
    }
  }

  .btn-checkout {
    background: #222;
    color: #fff;

    &:hover {
      background: #444;
    }
  }
`;

// 👇 생략되었던 Empty 스타일 컴포넌트
const Empty = styled.div`
  text-align: center;
  color: #777;
  padding: 80px 0;
`;

// --- Component ---
function formatCurrency(value: number): string {
  return value.toLocaleString() + "원";
}

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { fetchCartCount } = useCart();

  const fetchCartItems = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get("http://localhost:3001/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error("장바구니 로딩 실패:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);
  const onQty = async (itemId: string, qty: number) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(
        `http://localhost:3001/cart/${itemId}`,
        { quantity: qty },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCartItems(); // 목록 새로고침
    } catch (error) {
      console.error("수량 변경 실패:", error);
    }
  };

  const onRemove = async (itemId: string) => {
    const token = localStorage.getItem("accessToken");
    if (confirm("상품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:3001/cart/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartItems();
        fetchCartCount();
      } catch (error) {
        console.error("상품 삭제 실패:", error);
      }
    }
  };

  const total = useMemo<number>(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const onClear = async () => {
    const token = localStorage.getItem("accessToken");
    if (confirm("장바구니를 비우시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:3001/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartItems(); //DB에서 다시 불러옴
        fetchCartCount(); //헤더에서 숫자도 갱신함
      } catch (error) {
        console.error("장바구니 비우기 실패:", error);
      }
    }
  };

  if (items.length === 0) {
    return (
      <Page>
        <Title>장바구니</Title>
        <Empty>장바구니가 비어있어요.</Empty>
      </Page>
    );
  }

  return (
    <Page>
      <Title>장바구니</Title>
      <Table>
        <thead>
          <tr>
            <th>상품 정보</th>
            <th>가격</th>
            <th>수량</th>
            <th>합계</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: CartItem) => (
            <tr key={item.id}>
              <td>
                <ProductInfo>
                  <img src={`http://localhost:3001/uploads/${item.product.imageUrl}`} alt={item.product.name} />
                  <span>{item.product.name}</span>
                </ProductInfo>
              </td>
              <td>{formatCurrency(item.product.price)}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => onQty(item.id, Math.max(1, Number(e.target.value)))}
                />
              </td>
              <td>{formatCurrency(item.product.price * item.quantity)}</td>
              <td>
                <button onClick={() => onRemove(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <FooterBar>
        <button className="btn btn-clear" onClick={onClear}>
          장바구니 비우기
        </button>
        <div>
          <span style={{ marginRight: "16px", fontWeight: 600, fontSize: "16px" }}>
            총 결제금액: {formatCurrency(total)}
          </span>
          <button className="btn btn-checkout">주문하기</button>
        </div>
      </FooterBar>
    </Page>
  );
};

export default CartPage;
