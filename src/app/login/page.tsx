"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import Link from "next/link";
import ResendVerification from "@/components/ResendVerification";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Attempting login with credentials:", { email, password });
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log(result);

      // Check if the error is related to email verification
      if (result.error.includes("verify your email")) {
        showNotification("Please verify your email before logging in", "error");
        setShowVerificationForm(true);
      } else {
        showNotification(result.error, "error");
      }
    } else {
      showNotification("Login successful!", "success");
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="card-title text-center text-2xl flex justify-center">
            Login
          </h1>
          <button
            className="btn btn-outline flex justify-center"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Sign in with Google
          </button>

          <li className="divider my-1">or</li>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="btn btn-primary ">
                Login
              </button>
            </div>
            <p className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="link">
                Register
              </Link>
            </p>
          </form>

          {showVerificationForm && <ResendVerification />}
        </div>
      </div>
    </div>
  );
}
