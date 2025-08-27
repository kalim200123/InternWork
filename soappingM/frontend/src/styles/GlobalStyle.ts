// frontend/src/styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";
import MaruBuriBold from "../assets/fonts/MaruBuri-Bold.otf";
import MaruBuriLight from "../assets/fonts/MaruBuri-Light.otf";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'MaruBuri';
    src: url(${MaruBuriLight}) format('opentype');
    font-weight: 300; // Light
  }

  @font-face {
    font-family: 'MaruBuri';
    src: url(${MaruBuriBold}) format('opentype');
    font-weight: 500; // Bold
  }

  body {
    /*
      브라우저는 이 목록을 순서대로 확인합니다.
      1. 영어를 만나면 'MaruBuri'에 있는지 확인 -> 있으면 'MaruBuri' 사용 후 종료.
      2. 한글을 만나면 'MaruBuri'에 있는지 확인 -> 없으면 다음 폰트인 'Pretendard'로 이동 -> 'Pretendard' 사용.
    */
    font-family: 'MaruBuri', 'Pretendard', sans-serif;
    font-weight: 300;
  }
`;

export default GlobalStyle;
