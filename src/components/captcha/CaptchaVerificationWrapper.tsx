"use client";

import { useState, ReactNode } from "react";
import ReCaptchaComponent from "./ReCaptcha";
import { useNotification } from "../Notification";

interface CaptchaVerificationWrapperProps {
  children: ReactNode;
  onVerificationComplete: () => void;
  title?: string;
  description?: string;
}

export default function CaptchaVerificationWrapper({
  children,
  onVerificationComplete,
  title = "Human Verification Required",
  description = "Please complete the verification below to continue",
}: CaptchaVerificationWrapperProps) {
  const [isVerified, setIsVerified] = useState(false);
  const { showNotification } = useNotification();

  const handleCaptchaVerify = (token: string | null) => {
    if (token) {
      setIsVerified(true);
      showNotification("Verification successful", "success");
      onVerificationComplete();
    } else {
      setIsVerified(false);
    }
  };

  const handleCaptchaExpire = () => {
    setIsVerified(false);
    showNotification("Verification expired, please try again", "warning");
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-base-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-center mb-4">{description}</p>
      
      <ReCaptchaComponent 
        onVerify={handleCaptchaVerify} 
        onExpire={handleCaptchaExpire}
      />
      
      <div className="mt-4 text-sm text-center text-gray-500">
        This helps us prevent automated community creation and spam
      </div>
    </div>
  );
}
