"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const SLOTS = [
  { time: "16:00", label: "4:00 PM", serial: 1 },
  { time: "16:20", label: "4:20 PM", serial: 2 },
  { time: "16:40", label: "4:40 PM", serial: 3 },
  { time: "17:00", label: "5:00 PM", serial: 4 },
  { time: "17:20", label: "5:20 PM", serial: 5 },
  { time: "17:40", label: "5:40 PM", serial: 6 },
  { time: "18:00", label: "6:00 PM", serial: 7 },
  { time: "18:20", label: "6:20 PM", serial: 8 },
  { time: "18:40", label: "6:40 PM", serial: 9 },
  { time: "19:00", label: "7:00 PM", serial: 10 },
  { time: "19:20", label: "7:20 PM", serial: 11 },
  { time: "19:40", label: "7:40 PM", serial: 12 },
];

export default function BookPage() {
  const [date, setDate] = useState("");
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState<typeof SLOTS[0] | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const day = date ? new Date(date).getDay() : null;
  const isOff = day === 4 || day === 5;

  async function submit() {
    if (!date || !selected || !name || !phone) {
      alert("Date, slot, naam ar phone — sob dite hobe");
      return;
    }
    setSaving(true);

    // 1. Doctor-er id nao
    const { data: doctors } = await supabase.from("doctors").select("id").limit(1);
    if (!doctors || doctors.length === 0) {
      alert("Doctor pai nai — age doctors table-e info save koro");
      setSaving(false);
      return;
    }
    const doctorId = doctors[0].id;

    // 2. Ei date + time-e age theke booked ache kina dekho
    const { data: existing } = await supabase
      .from("slots")
      .select("id")
      .eq("date", date)
      .eq("time", selected.time)
      .eq("status", "booked");

    if (existing && existing.length > 0) {
      alert("Ei slot-ta already booked, onno slot nao");
      setSaving(false);
      return;
    }

    // 3. Slot-ta booked hishebe save koro
    const { data: slotData, error: slotError } = await supabase
      .from("slots")
      .insert({
        doctor_id: doctorId,
        date: date,
        time: selected.time,
        serial_no: selected.serial,
        status: "booked",
      })
      .select()
      .single();

    if (slotError || !slotData) {
      alert("Slot save hoy nai: " + (slotError?.message || "unknown error"));
      setSaving(false);
      return;
    }

    // 4. Appointment save koro
    const { error: apptError } = await supabase.from("appointments").insert({
      slot_id: slotData.id,
      patient_name: name,
      patient_age: age ? parseInt(age) : null,
      patient_phone: phone,
      problem: problem,
      status: "booked",
    });

    if (apptError) {
      alert("Appointment save hoy nai: " + apptError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setDone(true);
  }

  if (done && selected) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-green-600">Booking Confirm!</h1>
            <p className="mt-4 text-lg text-gray-900">Serial: {selected.serial}</p>
            <p className="text-gray-900">Date: {date}</p>
            <p className="text-gray-900">Time: {selected.label}</p>
            <p className="text-gray-900">Patient: {name}</p>
            <p className="text-gray-900">Fee: 500 Tk — Pay at chamber</p>
            <Link href="/" className="inline-block mt-6 text-blue-600 underline">
              Home-e firo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Dr. Adil Ahmed Meraj — 500 Tk</p>

          <label className="block mt-6 font-medium text-gray-900">Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => { setDate(e.target.value); setSelected(null); }}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900"
          />

          {date && isOff && (
            <p className="mt-4 text-red-600 font-medium">
              Thu - Fri off, ei dine kono slot nei.
            </p>
          )}

          {date && !isOff && (
            <>
              <p className="mt-6 font-medium text-gray-900">Slot choose koro — 20 minute</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SLOTS.map((s) => (
                  <button
                    key={s.time}
                    onClick={() => setSelected(s)}
                    className={
                      selected?.time === s.time
                        ? "bg-blue-600 text-white rounded-lg py-2"
                        : "bg-gray-100 text-gray-900 rounded-lg py-2"
                    }
                  >
                    {s.label}
                    <br />
                    <span className="text-xs">Serial {s.serial}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {selected && (
            <>
              <label className="block mt-6 font-medium text-gray-900">Patient Naam</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900" placeholder="Naam likho" />

              <label className="block mt-4 font-medium text-gray-900">Age</label>
              <input value={age} onChange={(e) => setAge(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900" placeholder="Age" />

              <label className="block mt-4 font-medium text-gray-900">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900" placeholder="01XXXXXXXXX" />

              <label className="block mt-4 font-medium text-gray-900">Somossa</label>
              <input value={problem} onChange={(e) => setProblem(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900" placeholder="Ki somossa?" />

              <button onClick={submit} disabled={saving} className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-full">
                {saving ? "Saving..." : `Confirm Booking — Serial ${selected.serial}`}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
