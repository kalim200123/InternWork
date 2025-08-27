// frontend/src/components/AuthModal.tsx
import axios from "axios";
import React, { useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";

// --- Styled-Components (새로운 디자인) ---

const ModalHeader = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 30px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 15px 5px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  font-size: 16px;

  &:focus {
    outline: none;
    border-bottom: 2px solid #333;
  }

  /* ✅ 유효성 오류 시 밑줄 빨간색 */
  &[aria-invalid="true"] {
    border-bottom-color: #ef4444;
  }
`;

const ErrorText = styled.p`
  margin: 4px 0 10px;
  font-size: 12px;
  color: #e11d48; /* rose-600 */
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const FooterSwitch = styled.div`
  margin-top: 20px;
  text-align: center;

  span {
    color: #999;
    margin-right: 10px;
  }

  button {
    background: none;
    border: none;
    color: #555;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
  }
`;

// --- Component ---
interface AuthModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onRequestClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ✅ 필드별 에러 상태
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
  }>({});

  // 👇 기존 함수 유지
  const clearInputs = () => {
    setName("");
    setPhoneNumber("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  // ✅ 간단 유효성 검사 (제출 시 체크)
  const validateLogin = (vals: { username: string; password: string }) => {
    const e: Record<string, string> = {};
    if (!vals.username.trim()) e.username = "아이디를 입력하세요.";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(vals.password))
      e.password = "비밀번호는 8자 이상(문자+숫자 포함)이어야 합니다.";
    return e;
  };

  const formatPhone = (digits: string) => {
    const only = digits.replace(/\D/g, "").slice(0, 11); // 최대 11자리
    if (only.length < 4) return only;
    if (only.length < 8) return `${only.slice(0, 3)}-${only.slice(3)}`;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11); // 숫자만
    setPhoneNumber(digits); // ✅ state에는 "숫자만" 저장
  };

  const validateRegister = (vals: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
  }) => {
    const e: Record<string, string> = {};
    if (!vals.name.trim() || vals.name.trim().length < 2) e.name = "이름은 2자 이상 입력해주세요.";
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(vals.username)) e.username = "아이디는 영문/숫자/_ 4~10자입니다.";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(vals.password))
      e.password = "비밀번호는 8자 이상(문자+숫자 포함)이어야 합니다.";
    if (!vals.confirmPassword.trim()) e.confirmPassword = "비밀번호 확인을 입력하세요.";
    else if (vals.password !== vals.confirmPassword) e.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!/^01[0-9]\d{7,8}$/.test(vals.phoneNumber)) {
      e.phoneNumber = "휴대폰 형식 예: 010-1234-5678";
    }
    return e;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 프론트 유효성 체크
    const eMap = validateRegister({ name, username, password, confirmPassword, phoneNumber });
    setErrors(eMap);
    if (Object.keys(eMap).length) return; // 에러 있으면 서버 호출 X

    try {
      await axios.post("http://localhost:3001/users", { name, username, password, phoneNumber });
      alert("회원가입에 성공했습니다! 이제 로그인해주세요.");
      handleChangeMode("login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 프론트 유효성 체크
    const eMap = validateLogin({ username, password });
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        name,
        username,
        password,
        phoneNumber: formatPhone(phoneNumber),
      });
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem("accessToken", access_token);
        alert("로그인에 성공했습니다!");
        onRequestClose();
        window.location.reload();
      } else {
        alert("로그인에 실패했습니다: 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  const handleCloseModal = () => {
    clearInputs();
    setErrors({}); // ✅ 에러도 초기화
    setMode("login");
    onRequestClose();
  };

  const handleChangeMode = (newMode: "login" | "register") => {
    clearInputs();
    setErrors({}); // ✅ 탭 전환 시 에러 초기화
    setMode(newMode);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          border: "none",
          borderRadius: "8px",
          padding: "40px",
        },
      }}
    >
      {mode === "login" ? (
        <div>
          <ModalHeader>로그인</ModalHeader>
          <form onSubmit={handleLogin}>
            <StyledInput
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!errors.username}
              autoComplete="username"
            />
            {errors.username && <ErrorText>{errors.username}</ErrorText>}

            <StyledInput
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}

            <SubmitButton type="submit">로그인</SubmitButton>
          </form>
          <FooterSwitch>
            <span>아직 회원이 아니신가요?</span>
            <button type="button" onClick={() => handleChangeMode("register")}>
              회원가입
            </button>
          </FooterSwitch>
        </div>
      ) : (
        <div>
          <ModalHeader>회원가입</ModalHeader>
          <form onSubmit={handleRegister} noValidate>
            <StyledInput
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              autoComplete="name"
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}

            <StyledInput
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!errors.username}
              autoComplete="username"
            />
            {errors.username && <ErrorText>{errors.username}</ErrorText>}

            <StyledInput
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              autoComplete="new-password"
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}

            <StyledInput
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}

            <StyledInput
              type="tel"
              placeholder="전화번호"
              value={formatPhone(phoneNumber)} // ✅ 보일 때만 포맷
              onChange={handlePhoneChange} // ✅ 숫자만 저장
              aria-invalid={!!errors.phoneNumber}
              inputMode="numeric"
              autoComplete="tel"
            />
            {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}

            <SubmitButton type="submit">가입하기</SubmitButton>
          </form>
          <FooterSwitch>
            <span>이미 회원이신가요?</span>
            <button type="button" onClick={() => handleChangeMode("login")}>
              로그인
            </button>
          </FooterSwitch>
        </div>
      )}
    </Modal>
  );
};

export default AuthModal;
