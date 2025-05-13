"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CaptchaContextType {
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  isCaptchaVerified: boolean;
  setIsCaptchaVerified: (verified: boolean) => void;
  resetCaptcha: () => void;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export function CaptchaProvider({ children }: { children: ReactNode }) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setIsCaptchaVerified(false);
  };

  return (
    <CaptchaContext.Provider
      value={{
        captchaToken,
        setCaptchaToken,
        isCaptchaVerified,
        setIsCaptchaVerified,
        resetCaptcha,
      }}
    >
      {children}
    </CaptchaContext.Provider>
  );
}

export function useCaptcha() {
  const context = useContext(CaptchaContext);
  if (context === undefined) {
    throw new Error("useCaptcha must be used within a CaptchaProvider");
  }
  return context;
}
