"use client";

import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  siteKey?: string;
}

export default function ReCaptchaComponent({
  onVerify,
  onExpire,
  siteKey,
}: ReCaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Use the provided site key or fall back to the environment variable
  const captchaSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    if (onExpire) {
      onExpire();
    }
    onVerify(null);
  };

  if (!isLoaded) {
    return <div className="h-[78px] w-full bg-gray-100 animate-pulse rounded"></div>;
  }

  if (!captchaSiteKey) {
    console.error("ReCAPTCHA site key is missing");
    return (
      <div className="text-error text-sm p-2 border border-error rounded">
        ReCAPTCHA configuration error. Please contact the administrator.
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={captchaSiteKey}
        onChange={handleChange}
        onExpired={handleExpired}
      />
    </div>
  );
}
