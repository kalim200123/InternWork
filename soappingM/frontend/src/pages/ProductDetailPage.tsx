// frontend/src/pages/ProductDetailPage.tsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types";

// --- Styled-Components (버튼 스타일 추가) ---

const DetailContainer = styled.div`
  display: flex;
  gap: 50px;
  margin-top: 50px;
`;

const ProductImage = styled.img`
  width: 500px;
  height: 500px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProductName = styled.h1`
  font-size: 32px;
  font-weight: 700;
`;

const ProductPrice = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin: 10px 0 20px 0;
`;

const ProductDescription = styled.p`
  color: #555;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  padding: 15px 20px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #fff;
  margin-right: 10px;
  margin-top: 30px;

  &:hover {
    background-color: #f8f8f8;
  }

  &.primary {
    background-color: #333;
    color: white;

    &:hover {
      background-color: #555;
    }
  }
`;

// --- Component ---
const loggedIn = !!localStorage.getItem("accessToken");

const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const { id } = useParams<{ id: string }>(); // URL의 id 값을 가져옴
  const { fetchCartCount } = useCart();

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3001/products/${id}`)
        .then((response) => {
          setProduct(response.data);
        })
        .catch((error) => {
          console.error("상품 상세 정보를 불러오는 데 실패했습니다.", error);
        });
    }
  }, [id]);

  // 👇 장바구니 추가 핸들러 함수
  const handleAddToCart = async () => {
    // 1. 브라우저에서 '출입증(accessToken)'을 가져옵니다.
    const token = localStorage.getItem("accessToken");

    // 2. 출입증이 없으면 로그인하라고 요청합니다.
    if (!token) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    try {
      // 3. 백엔드에 '장바구니에 추가해줘'라고 요청합니다.
      await axios.post(
        "http://localhost:3001/cart/add",
        {
          productId: id,
          quantity: 1, // 일단 1개만 담도록 고정
        },
        {
          headers: {
            // 4. 요청 시 출입증을 함께 보냅니다.
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("장바구니에 상품을 담았습니다.");
      fetchCartCount();
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert("장바구니에 상품을 담는 데 실패했습니다.");
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <DetailContainer>
        <ProductImage src={`http://localhost:3001/uploads/${product.imageUrl}`} alt={product.name} />
        <ProductInfo>
          <ProductName>{product.name}</ProductName>
          <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
          <ProductDescription>{product.description}</ProductDescription>
          <div>
            <ActionButton
              onClick={handleAddToCart}
              disabled={!loggedIn}
              title={loggedIn ? "" : "로그인 후 이용 가능합니다."}
            >
              장바구니 담기
            </ActionButton>
            <ActionButton className="primary">바로 구매</ActionButton>
          </div>
        </ProductInfo>
      </DetailContainer>
    </div>
  );
};

export default ProductDetailPage;
