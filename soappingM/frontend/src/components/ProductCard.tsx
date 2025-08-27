// frontend/src/components/ProductCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type { Product } from "../types";

// 👇 이 부분을 수정합니다.
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block; /* transition 효과가 잘 적용되도록 block으로 변경 */
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out; /* 부드러운 효과 */

  &:hover {
    transform: translateY(-5px); /* 마우스를 올리면 살짝 위로 이동 */
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  }
`;

const CardContainer = styled.div`
  text-align: center;
  font-family: Arial, sans-serif;
  /* hover 시 그림자가 잘 보이도록 약간의 패딩을 추가할 수 있습니다. */
  padding-bottom: 10px;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background-color: #f8f8f8;
  margin-bottom: 10px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: normal;
  margin: 0 0 5px 0;
`;

const ProductPrice = styled.p`
  font-size: 14px;
  color: #777;
  margin: 0;
`;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <StyledLink to={`/product/${product.id}`}>
      <CardContainer>
        <ProductImage src={`http://localhost:3001/uploads/${product.imageUrl}`} alt={product.name} />
        <ProductName>{product.name}</ProductName>
        <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
      </CardContainer>
    </StyledLink>
  );
};

export default ProductCard;
