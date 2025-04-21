// Comprehensive environment variable checker
import dotenv from "dotenv";
dotenv.config({
  path:
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.local",
});

console.log("Environment Check Results:");
console.log("-------------------------");
console.log(
  "NODE_ENV:",
  process.env.NODE_ENV || "undefined (defaulting to development)"
);
console.log("\nAuth Configuration:");
console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("NEXTAUTH_URL exists:", !!process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);

console.log("\nDatabase Configuration:");
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log(
  "Database name:",
  process.env.MONGODB_URI?.split("/").pop()?.split("?")[0] || "undefined"
);

console.log("\nImageKit Configuration:");
console.log("PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
console.log(
  "NEXT_PUBLIC_PUBLIC_KEY exists:",
  !!process.env.NEXT_PUBLIC_PUBLIC_KEY
);
console.log(
  "NEXT_PUBLIC_URL_ENDPOINT exists:",
  !!process.env.NEXT_PUBLIC_URL_ENDPOINT
);

console.log("\nEmail Configuration:");
console.log("EMAIL_SERVER_HOST exists:", !!process.env.EMAIL_SERVER_HOST);
console.log("EMAIL_SERVER_PORT exists:", !!process.env.EMAIL_SERVER_PORT);
console.log("EMAIL_SERVER_USER exists:", !!process.env.EMAIL_SERVER_USER);
console.log(
  "EMAIL_SERVER_PASSWORD exists:",
  !!process.env.EMAIL_SERVER_PASSWORD
);
console.log("EMAIL_FROM exists:", !!process.env.EMAIL_FROM);

console.log("\nOther Configuration:");
console.log("AUTO_VERIFY_EMAIL:", process.env.AUTO_VERIFY_EMAIL || "undefined");
console.log(
  "NEXT_PUBLIC_APP_NAME:",
  process.env.NEXT_PUBLIC_APP_NAME || "undefined"
);
