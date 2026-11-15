'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    fetch('/api/payment-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.paid) setVerified(true);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-6">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
      <p className="mt-4 text-lg">Thank you! Your appointment booking payment is complete.</p>
      {verified && <p className="mt-2 text-green-600">Payment verified and saved.</p>}
      <a href="/book" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
        Book Another Appointment
      </a>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
