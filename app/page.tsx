import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Dr. Adil Ahmed Meraj
          </h1>
          <p className="mt-2 text-lg text-blue-600 font-medium">
            General Physician
          </p>
          <p className="mt-2 text-gray-600">
            Chamber: Rajlokkhi, Uttara, Dhaka
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8 text-left">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-xl font-bold">500 Tk</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Slot Duration</p>
              <p className="text-xl font-bold">20 Minute</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Working Days</p>
              <p className="text-xl font-bold">Sat - Wed</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Working Hours</p>
              <p className="text-xl font-bold">4:00 PM - 8:00 PM</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Thu - Fri off • Daily Patient Limit: 12 person
          </p>

          <Link
            href="/book"
            className="inline-block mt-8 bg-blue-600 text-white font-semibold px-8 py-3 rounded-full"
          >
            Book Appointment
          </Link>
          <Link href="/my-appointments" className="inline-block mt-3 text-blue-600 underline">
  My Appointment — Cancel / Reschedule
</Link>

        </div>
      </div>
    </main>
  );
}
