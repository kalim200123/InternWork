// frontend/src/pages/ProductListPage.tsx
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import styled from "styled-components";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

type SearchableProduct = Product & {
  name?: string;
  title?: string;
  description?: string;
};
// --- Styled-Components ---
const CONTROL_H = "34px";
const CONTROL_RADIUS = "5px";
const SEARCH_W = "220px";

const AnimatedSection = styled.section<{ $inView: boolean }>`
  text-align: center;
  padding: 80px 0;
  max-width: 700px;
  margin: 0 auto;
  opacity: ${(p) => (p.$inView ? 1 : 0)};
  transform: ${(p) => (p.$inView ? "translateY(0)" : "translateY(20px)")};
  transition: opacity 2s ease-out, transform 0.8s ease-out;
`;
const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 550;
  margin: 0 0 10px 0;
`;
const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #555;
`;
const CategoryFilter = styled.div`
  display: flex;
  align-items: center;
  height: ${CONTROL_H};
  gap: 20px; /* 버튼 사이 간격 */
`;
//margin-bottom: 30px;

const CategoryButton = styled.button<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 100%; /* CategoryFilter의 높이와 동일 */
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  font-weight: ${(p) => (p.$isActive ? "bold" : "normal")};
  color: ${(p) => (p.$isActive ? "#000" : "#777")};

  border-bottom: ${(p) => (p.$isActive ? "1px solid #525252ff" : "1px solid transparent")};
  padding-bottom: 1px;

  &:hover {
    border-bottom-color: ${(p) => (p.$isActive ? "#525252ff" : "#bbb")};
    color: #525252ff;
  }
`;

// 카테고리(왼쪽) + 검색바(오른쪽)
const TopRow = styled.div`
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

/* 검색 UI (이미지 같은 스타일) */
const SearchWrap = styled.form`
  position: relative;
  width: ${SEARCH_W};
  max-width: 100%;
  height: ${CONTROL_H};
`;
const SearchInput = styled.input`
  width: 81%;
  height: 100%;
  padding: 0 28px 0 12px; /* 오른쪽 여백 = 아이콘(16~18px) + 10~12px */
  font-size: 12px; /* 카테고리와 동일 */
  border: 1px solid #dcdcdc;
  border-radius: ${CONTROL_RADIUS};
  background: #fff;
  outline: none;
  transition: border-color 0.15s ease;
  &::placeholder {
    color: #b5b5b5;
  }
  &:focus {
    border-color: #b5b5b5;
  }
`;

/* 돋보기를 입력창 '끝'에 딱 붙임 (여백 최소화) */
const SearchIcon = styled.svg`
  position: absolute;
  right: 6px; /* 아이콘을 거의 끝까지 붙임 */
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 18px;
  opacity: 0.7;
  pointer-events: none;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
`;

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "soap" | "candle">("all");
  const [q, setQ] = useState("");

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // 카테고리 바뀔 때 서버에서 목록 로딩
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`http://localhost:3001/products?category=${activeCategory}`, { signal: controller.signal })
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err?.code !== "ERR_CANCELED") console.error("상품 목록 로딩 실패:", err);
      });
    return () => controller.abort();
  }, [activeCategory]);

  const visibleProducts = useMemo<Product[]>(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return products;

    const lower = (v?: string | null) => (v ?? "").toLowerCase();

    return products.filter((p) => {
      const sp = p as SearchableProduct;
      const name = lower(sp.name ?? sp.title);
      const desc = lower(sp.description);
      return name.includes(kw) || desc.includes(kw);
    });
  }, [products, q]);

  return (
    <div>
      <AnimatedSection ref={ref} $inView={inView}>
        <HeroTitle>Handmade Soap</HeroTitle>
        <HeroSubtitle>Crafted with nature, for your skin.</HeroSubtitle>
      </AnimatedSection>

      <TopRow>
        <CategoryFilter>
          <CategoryButton $isActive={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
            all
          </CategoryButton>
          <CategoryButton $isActive={activeCategory === "soap"} onClick={() => setActiveCategory("soap")}>
            soap
          </CategoryButton>
          <CategoryButton $isActive={activeCategory === "candle"} onClick={() => setActiveCategory("candle")}>
            candle
          </CategoryButton>
        </CategoryFilter>

        <SearchWrap role="search" onSubmit={(e) => e.preventDefault()}>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="상품 검색" />
          <SearchIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="21" y2="21" />
          </SearchIcon>
        </SearchWrap>
      </TopRow>

      <ProductGrid>
        {visibleProducts.map((p, i) => (
          <div key={p.id} data-aos="fade-up" data-aos-delay={i * 40}>
            <ProductCard product={p} />
          </div>
        ))}
      </ProductGrid>
    </div>
  );
};

export default ProductListPage;
