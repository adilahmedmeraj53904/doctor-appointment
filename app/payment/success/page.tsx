export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-6">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
      <p className="mt-4 text-lg">Thank you! Your appointment booking payment is complete.</p>
      <a href="/book" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
        Book Another Appointment
      </a>
    </div>
  );
}
