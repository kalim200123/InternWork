// frontend/src/components/Footer.tsx
import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #222; /* 어두운 배경색 */
  color: #aaa; /* 밝은 글자색 */
  padding: 40px 60px;
  margin-top: 80px; /* 메인 콘텐츠와의 간격 */
  font-size: 12px;
  line-height: 1.6;
`;

const FooterGrid = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

const InfoSection = styled.div`
  p {
    margin: 0 0 5px 0;
  }
`;

const LinksSection = styled.div`
  text-align: right;

  a {
    color: #b7b7b7ff;
    text-decoration: none;
    margin-left: 20px;

    &:hover {
      color: #fff;
    }
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterGrid>
        <InfoSection>
          <p style={{ color: "#ffffffb4", fontWeight: "bold", marginBottom: "15px" }}>Soapping M</p>
          <p>CEO: ABC | Business License: 000-00-00000</p>
          <p>Address: Seoul, Korea | CS: +82 (0)10-1234-5678</p>
          <p>Terms of Use | Privacy</p>
        </InfoSection>
        <LinksSection>
          <a href="#">Instagram</a>
          <a href="#">KakaoTalk</a>
        </LinksSection>
      </FooterGrid>
    </FooterContainer>
  );
};

export default Footer;
