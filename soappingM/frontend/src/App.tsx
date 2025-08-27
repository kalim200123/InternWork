import AOS from "aos";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { Link, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import { useCart } from "./hooks/useCart";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import NoticePage from "./pages/NoticePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductListPage from "./pages/ProductListPage";
import ShopPage from "./pages/ShopPage";
import GlobalStyle from "./styles/GlobalStyle";

Modal.setAppElement("#root");

// frontend/src/App.tsx

const AppContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0px auto;
  padding: 0 60px;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
  min-height: 56px; /* 헤더 높이를 고정값으로 지정 */
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  font-family: "MaruBuri", serif;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  height: 60%; /* 부모(Header)의 높이를 따라가도록 설정 */
`;

const NavItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 60%;
  margin-left: 15px;

  a,
  button {
    font-family: "MaruBuri", "Pretendard", sans-serif;
    text-decoration: none;
    color: #333;
    font-size: 12px !important; /* ← 강제 적용 */
    transition: color 0.2s ease-in-out;

    &:hover {
      color: #999;
    }
  }

  button {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    font-size: 20px;
  }
`;
// ▼ 드롭다운 궤적(아래+오른쪽) & 페이드/슬라이드
const DropdownMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 110%;
  left: 0;
  transform: translate(8px, 6px) scale(${(p) => (p.$open ? 1 : 0.98)});
  transform-origin: top left;
  min-width: 150px;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.06);
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 20;
`;

// ▼ 목록 래퍼 (세로 간격)
const MenuCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// ▼ 항목: 기본(흰 배경/회색 글자) → 호버(검정 배경/흰 글자)로 "그라데이션처럼 차오르는" 효과
const MenuItem = styled(Link)`
  position: relative;
  display: block;
  padding: 12px 16px;
  border-radius: 4px;
  color: #777;
  text-decoration: none;
  overflow: hidden;
  background-image: linear-gradient(90deg, #111, #111);
  background-repeat: no-repeat;
  background-size: 0% 100%;
  transition: background-size 0.35s ease, color 0.25s ease, transform 0.12s ease;

  &:hover {
    color: #ffffff !important;
    background-size: 100% 100%;
    transform: translateX(2px);
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // 애니메이션 길이
      easing: "ease-out",
      once: true, // 한 번만 재생 (스크롤 위아래로 움직일 때 반복 X)
      offset: 20, // 트리거 오프셋
    });
    // AOS.refresh(); // 레이아웃 변동이 잦으면 켜도 됨
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { cartCount } = useCart();
  const [isShopMenuOpen, setShopMenuOpen] = useState(false);

  let menuTimeout: NodeJS.Timeout;

  const handleMenuEnter = () => {
    // 👇 2. 닫히려는 타이머가 있다면 취소합니다.
    clearTimeout(menuTimeout);
    setShopMenuOpen(true);
  };

  const handleMenuLeave = () => {
    // 👇 3. 0.2초 후에 메뉴를 닫도록 타이머를 설정합니다.
    menuTimeout = setTimeout(() => {
      setShopMenuOpen(false);
    }, 200);
  };

  const handleLoginSuccess = (token: string, role?: string) => {
    localStorage.setItem("accessToken", token);
    if (role) localStorage.setItem("role", role);

    setIsLoggedIn(true); // ← 헤더 버튼이 LOGIN → LOGOUT 으로 즉시 반영
    if (role) setUserRole(role);
    setIsModalOpen(false); // 로그인 모달 닫기
  };
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUserRole(null);

    alert("로그아웃 되었습니다.");
    window.location.reload();
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <StyledLink to="/">
            <Logo>Soapping M</Logo>
          </StyledLink>
          {/* 👇 Nav 메뉴 항목 수정 */}
          <Nav>
            <NavItem onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
              <Link to="/shop">SHOP</Link>
              <DropdownMenu $open={isShopMenuOpen}>
                <MenuCol>
                  <MenuItem to="/shop?category=soap">Soap</MenuItem>
                  <MenuItem to="/shop?category=candle">Candle</MenuItem>
                </MenuCol>
              </DropdownMenu>
            </NavItem>

            <NavItem>
              <Link to="/about">ABOUT</Link>
            </NavItem>
            <NavItem>
              <Link to="/notice">NOTICE</Link>
            </NavItem>
            <NavItem>
              <Link to="/contact">CONTACT</Link>
            </NavItem>
            <NavItem>
              {isLoggedIn ? (
                <button onClick={handleLogout}>LOGOUT</button>
              ) : (
                <button onClick={() => setIsModalOpen(true)}>LOGIN</button>
              )}
            </NavItem>
            <NavItem>
              <Link to="/cart">CART ({cartCount})</Link>
            </NavItem>
          </Nav>
        </Header>

        <main>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            {userRole === "admin" && <Route path="/admin/add-product" element={<AdminPage />} />}
            {/* 👇 3. 새로운 페이지 경로들 추가 */}
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/notice" element={<NoticePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
      </AppContainer>
      <Footer />
      <AuthModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSuccess={handleLoginSuccess} // ← 이 줄 추가
      />
    </>
  );
}

export default App;
