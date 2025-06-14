import { checkRazorpayConfig } from "@/lib/razorpay";

// Validate Razorpay configuration on server startup
checkRazorpayConfig();
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SKOOL",
  description: "Monitize your audience with SKOOL",
};
