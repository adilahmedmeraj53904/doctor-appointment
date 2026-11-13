"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Booking = {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_age: number | null;
  patient_phone: string;
  problem: string | null;
  status: string;
  slotDate: string;
  slotTime: string;
  serial: number;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);

const [unlocked, setUnlocked] = useState(false);
const [password, setPassword] = useState('');
const [error, setError] = useState('');



async function login() {
  const res = await fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (res.ok) {
    sessionStorage.setItem('admin', '1');
    setUnlocked(true);
  } else {
    setError('Wrong password');
  }
}

  useEffect(() => {
    async function load() {
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, slot_id, patient_name, patient_age, patient_phone, problem, status")
        .eq("status", "booked");

      const { data: slots } = await supabase
        .from("slots")
        .select("id, date, time, serial_no");

      const slotMap: Record<string, { date: string; time: string; serial_no: number }> = {};
      (slots || []).forEach((s: any) => {
        slotMap[s.id] = s;
      });

      const list: Booking[] = ((appts as any[]) || []).map((a: any) => ({
        id: a.id,
        slot_id: a.slot_id,
        patient_name: a.patient_name,
        patient_age: a.patient_age,
        patient_phone: a.patient_phone,
        problem: a.problem,
        status: a.status,
        slotDate: slotMap[a.slot_id]?.date || "-",
        slotTime: slotMap[a.slot_id]?.time || "-",
        serial: slotMap[a.slot_id]?.serial_no || 0,
      }));

      list.sort((a, b) => {
        if (a.slotDate !== b.slotDate) return a.slotDate.localeCompare(b.slotDate);
        return a.slotTime.localeCompare(b.slotTime);
      });

      setBookings(list);
      setLoading(false);
    }
    load();
  }, []);

  const shown = filterDate
    ? bookings.filter((b) => b.slotDate === filterDate)
    : bookings;
if (!unlocked) {
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 20 }}>
      <h1>Admin Login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter admin password"
      />
      <button onClick={login}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin — Patient List</h1>
          <p className="text-gray-600 mt-1">Dr. Adil Ahmed Meraj — All booking</p>

          <label className="block mt-6 font-medium text-gray-900">Put a date (If you dont feel you will see all apointments)</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900"
          />

          {loading && <p className="mt-6 text-gray-600">Loading...</p>}

          {!loading && shown.length === 0 && (
            <p className="mt-6 text-gray-600"> No booking was found.</p>
          )}

          {shown.map((b) => (
            <div key={b.id} className="border rounded-xl p-4 mt-4">
              <p className="font-bold text-gray-900">
                Serial {b.serial} — {b.patient_name}
              </p>
              <p className="text-gray-900">Date: {b.slotDate} — Time: {b.slotTime}</p>
              <p className="text-gray-900">Age: {b.patient_age ?? "-"} — Phone: {b.patient_phone}</p>
              <p className="text-gray-900">Problem: {b.problem || "-"}</p>
              <p className="text-gray-900">Status: {b.status}</p>
            </div>
          ))}

          <Link href="/" className="inline-block mt-6 text-blue-600 underline">
            Back to Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
