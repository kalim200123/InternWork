// src/validation/signupSchema.ts
import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "이름은 2자 이상").max(10, "이름은 10자 이하"),
    email: z.string().trim().toLowerCase().email("올바른 이메일 형식"),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상")
      .max(64, "비밀번호는 64자 이하")
      .regex(/[a-z]/, "소문자 1개 이상")
      .regex(/[0-9]/, "숫자 1개 이상"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .trim()
      .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "휴대폰 형식 예: 010-1234-5678"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않습니다",
  });
export type SignupInput = z.infer<typeof signupSchema>;
