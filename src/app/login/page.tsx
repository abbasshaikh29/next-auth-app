"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log(result);
      showNotification(result.error, "error");
    } else {
      showNotification("Login successful!", "success");
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="card-title text-center text-2xl">Login</h1>
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
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input input-bordered"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
            <p className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="link">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
