"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";

export default function PaymentSettings() {
  const { data: session } = useSession();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiration: "",
    cvc: "",
    billingAddress: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update payment information"
        );
      }

      setSuccess("Payment information updated successfully");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update payment information"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label htmlFor="cardNumber" className="label">
            <span className="label-text">Card Number</span>
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={paymentInfo.cardNumber}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label htmlFor="expiration" className="label">
              <span className="label-text">Expiration Date</span>
            </label>
            <input
              type="text"
              id="expiration"
              name="expiration"
              value={paymentInfo.expiration}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="cvc" className="label">
              <span className="label-text">CVC</span>
            </label>
            <input
              type="text"
              id="cvc"
              name="cvc"
              value={paymentInfo.cvc}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="CVC"
              required
            />
          </div>
        </div>
        <div className="form-control">
          <label htmlFor="billingAddress" className="label">
            <span className="label-text">Billing Address</span>
          </label>
          <input
            type="text"
            id="billingAddress"
            name="billingAddress"
            value={paymentInfo.billingAddress}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="123 Main St, City, Country"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && (
          <div className="text-green-500 text-sm mt-2">{success}</div>
        )}
        <button type="submit" className="btn btn-primary">
          Save Payment Information
        </button>
      </form>
    </div>
  );
}
