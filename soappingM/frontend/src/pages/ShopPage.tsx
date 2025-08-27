// frontend/src/pages/ShopPage.tsx
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ← navigate는 nav로 쓰면 충돌 없음
import styled from "styled-components";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

// === styled-components 영역 ===

const SHOP_CONTROL_H = "34px";
const SHOP_SEARCH_W = "220px";

const PageContainer = styled.div`
  min-height: 60vh;
`;

const CategoryFilter = styled.div`
  display: flex; /* ✅ 가로로 배치 */
  align-items: center; /* ✅ 세로 중앙 정렬 */
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 20px;
`;

const CategoryButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  font-weight: ${(props) => (props.$isActive ? "bold" : "normal")};
  color: ${(props) => (props.$isActive ? "#000" : "#777")};
  transition: color 0.2s ease;
  height: ${SHOP_CONTROL_H};
  display: inline-flex;
  align-items: center;
  padding: 0 12px;

  border-bottom: ${(p) => (p.$isActive ? "1px solid #525252ff" : "1px solid transparent")};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-bottom-color: ${(p) => (p.$isActive ? "#525252ff" : "#bbb")};
    color: #525252ff;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
`;

const ShopTopRow = styled.div`
  display: flex;
  align-items: center; /* 카테고리와 수직 정렬 맞춤 */
  justify-content: space-between;
  gap: 16px;
  margin: 0px 0 30px;
  flex-wrap: wrap;
`;

const ShopSearchWrap = styled.form`
  position: relative;
  width: ${SHOP_SEARCH_W};
  height: ${SHOP_CONTROL_H};
  max-width: 100%;
`;

const ShopSearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 26px 0 12px; /* 오른쪽 아이콘 들어갈 자리 */
  font-size: 12px; /* 카테고리 폰트와 동일 */
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  outline: none;
  &:focus {
    border-color: #111;
  }
  &::placeholder {
    color: #b5b5b5;
  }
`;

const ShopSearchIcon = styled.svg`
  position: absolute;
  right: 2px; /* 검색창 ‘끝’에 거의 붙임 */
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.7;
  pointer-events: none; /* 입력 방해 X */
`;

//component

type SearchableProduct = Product & { name?: string; title?: string; description?: string };

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const location = useLocation();
  const nav = useNavigate(); // ← 이름을 nav로
  const [q, setQ] = useState("");

  const visibleProducts = useMemo<Product[]>(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return products;
    const lower = (v?: string | null) => (v ?? "").toLowerCase();
    return products.filter((p) => {
      const sp = p as SearchableProduct;
      return lower(sp.name ?? sp.title).includes(kw) || lower(sp.description).includes(kw);
    });
  }, [products, q]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category") || "all";
    setActiveCategory((prev) => (prev !== cat ? cat : prev));
  }, [location.search]);

  // 2) activeCategory가 바뀌면 목록 로딩 (메인과 동일한 체감)
  useEffect(() => {
    axios
      .get(`http://localhost:3001/products?category=${activeCategory}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("상품 목록 로딩 실패:", err));
  }, [activeCategory]);

  // (선택) 내부 버튼 클릭 시 URL도 함께 맞추고 싶다면 nav(...)도 호출
  const onClickCat = (next: "all" | "soap" | "candle") => {
    setActiveCategory(next); // 화면 즉시 반응
    nav(`/shop?category=${next}`); // 주소도 동기화 (원치 않으면 이 줄은 빼도 됨)
  };

  return (
    <PageContainer>
      <ShopTopRow data-aos="fade-up">
        <CategoryFilter>
          <CategoryButton $isActive={activeCategory === "all"} onClick={() => onClickCat("all")}>
            all
          </CategoryButton>
          <CategoryButton $isActive={activeCategory === "soap"} onClick={() => onClickCat("soap")}>
            soap
          </CategoryButton>
          <CategoryButton $isActive={activeCategory === "candle"} onClick={() => onClickCat("candle")}>
            candle
          </CategoryButton>
        </CategoryFilter>

        <ShopSearchWrap role="search" onSubmit={(e) => e.preventDefault()}>
          <ShopSearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="상품 검색"
          />
          <ShopSearchIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="21" y2="21" />
          </ShopSearchIcon>
        </ShopSearchWrap>
      </ShopTopRow>

      <ProductGrid>
        {visibleProducts.map((p, i) => (
          <div key={p.id} data-aos="fade-up" data-aos-delay={i * 20}>
            <ProductCard product={p} />
          </div>
        ))}
      </ProductGrid>
    </PageContainer>
  );
};

export default ShopPage;
