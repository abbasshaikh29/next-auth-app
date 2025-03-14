"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PaymentDisplay() {
  const { slug } = useParams();
  const [payments, setPayments] = useState<
    Array<{ date: string; amount: number; status: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`/api/community/${slug}/payments`);
        const data = await res.json();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [slug]);

  if (isLoading) return <div>Loading payments...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment History</h3>
      {payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <div className="space-y-2">
          {payments.map((payment, index) => (
            <div key={index} className="p-4 border rounded">
              <div>Date: {payment.date}</div>
              <div>Amount: ${payment.amount}</div>
              <div>Status: {payment.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
