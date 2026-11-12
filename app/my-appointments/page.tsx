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

type Appt = {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_phone: string;
  problem: string;
  status: string;
  date: string;
  time: string;
  serial_no: number;
  doctor_id: string;
};

export default function MyAppointmentPage() {
  const [phone, setPhone] = useState("");
  const [list, setList] = useState<Appt[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState<typeof SLOTS[0] | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function loadBooked() {
      if (!newDate) {
        setBookedTimes([]);
        return;
      }
      const { data } = await supabase
        .from("slots")
        .select("time")
        .eq("date", newDate)
        .eq("status", "booked");
      setBookedTimes((data || []).map((s: any) => s.time));
      setNewSlot(null);
    }
    loadBooked();
  }, [newDate]);

  function canChange(date: string, time: string) {
    const apptTime = new Date(`${date}T${time}:00`).getTime();
    const now = new Date().getTime();
    return apptTime - now > 2 * 60 * 60 * 1000;
  }

  async function search() {
    if (!phone) {
      alert("Enter your Phone number");
      return;
    }
    setLoading(true);
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_phone", phone)
      .eq("status", "booked");

    if (!appts || appts.length === 0) {
      setList([]);
      setSearched(true);
      setLoading(false);
      return;
    }

    const slotIds = appts.map((a: any) => a.slot_id);
    const { data: slots } = await supabase
      .from("slots")
      .select("*")
      .in("id", slotIds);

    const slotMap: any = {};
    (slots || []).forEach((s: any) => (slotMap[s.id] = s));

    const joined: Appt[] = appts.map((a: any) => ({
      ...a,
      date: slotMap[a.slot_id]?.date || "",
      time: slotMap[a.slot_id]?.time || "",
      serial_no: slotMap[a.slot_id]?.serial_no || 0,
      doctor_id: slotMap[a.slot_id]?.doctor_id || "",
    }));
    joined.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    setList(joined);
    setSearched(true);
    setLoading(false);
  }

  async function cancelAppt(a: Appt) {
    if (!canChange(a.date, a.time)) {
      alert("If you cancel it then fill up it 2 hours before your appointment");
      return;
    }
    if (!confirm("Are you sure to cancel your appointment?")) return;

    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", a.id);
    await supabase.from("slots").update({ status: "available" }).eq("id", a.slot_id);
    alert("Booking cancel hoye geche");
    search();
  }

  async function confirmReschedule(a: Appt) {
    if (!newDate || !newSlot) {
      alert("Choose new date and slot");
      return;
    }
    if (!canChange(a.date, a.time)) {
      alert("If you cancel it then fill up it 2 hours before your appointment");
      return;
    }
    const day = new Date(newDate).getDay();
    if (day === 4 || day === 5) {
      alert("Thursday to Friday closed");
      return;
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (new Date(newDate) > maxDate) {
      alert("You can not book before 7 days ago!");
      return;
    }

    const { data: existing } = await supabase
      .from("slots")
      .select("id")
      .eq("date", newDate)
      .eq("time", newSlot.time)
      .eq("status", "booked");
    if (existing && existing.length > 0) {
      alert("This slot is already booked. Choose another one");
      return;
    }

    const { data: newSlotRow } = await supabase
      .from("slots")
      .insert({
        doctor_id: a.doctor_id,
        date: newDate,
        time: newSlot.time,
        serial_no: newSlot.serial,
        status: "booked",
      })
      .select()
      .single();

    if (!newSlotRow) {
      alert("New slot is not saved");
      return;
    }

    await supabase.from("slots").update({ status: "available" }).eq("id", a.slot_id);
    await supabase.from("appointments").update({ slot_id: newSlotRow.id }).eq("id", a.id);

    alert(`Reschedule hoye geche — Notun Serial ${newSlot.serial}, ${newDate}, ${newSlot.label}`);
    setRescheduleId(null);
    setNewDate("");
    setNewSlot(null);
    search();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900">My Appointment</h1>
          <p className="text-gray-600 mt-1">Enter your phone number to find your appointment</p>

          <label className="block mt-6 font-medium text-gray-900">Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900"
            placeholder="01XXXXXXXXX"
          />
          <button onClick={search} disabled={loading} className="w-full mt-4 bg-blue-600 text-white font-semibold py-3 rounded-full">
            {loading ? "Searching your booking" : "Search Booking"}
          </button>

          {searched && list.length === 0 && (
            <p className="mt-6 text-gray-900">There is no booking in this number.</p>
          )}

          {list.map((a) => (
            <div key={a.id} className="mt-6 border rounded-xl p-4">
              <p className="font-bold text-gray-900">Serial {a.serial_no} — {a.patient_name}</p>
              <p className="text-gray-900">Date: {a.date}</p>
              <p className="text-gray-900">Time: {a.time}</p>
              <p className="text-gray-900">Problem: {a.problem || "-"}</p>

              {rescheduleId === a.id ? (
                <>
                  <label className="block mt-4 font-medium text-gray-900">New date</label>
                  <input
                    type="date"
                    min={today}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-900"
                  />
                  {newDate && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {SLOTS.map((s) => {
                        const isBooked = bookedTimes.includes(s.time);
                        return (
                          <button
                            key={s.time}
                            disabled={isBooked}
                            onClick={() => setNewSlot(s)}
                            className={isBooked ? "bg-gray-300 text-gray-500 rounded-lg py-2 line-through" : newSlot?.time === s.time ? "bg-blue-600 text-white rounded-lg py-2" : "bg-gray-100 text-gray-900 rounded-lg py-2"}
                          >
                            {s.label}
                            <br />
                            <span className="text-xs">{isBooked ? "Booked" : `Serial ${s.serial}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => confirmReschedule(a)} className="w-full mt-4 bg-green-600 text-white font-semibold py-2 rounded-full">
                    Confirm Reschedule
                  </button>
                  <button onClick={() => setRescheduleId(null)} className="w-full mt-2 bg-gray-200 text-gray-900 py-2 rounded-full">
                    Back
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setRescheduleId(a.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-full">
                    Reschedule
                  </button>
                  <button onClick={() => cancelAppt(a)} className="flex-1 bg-red-600 text-white py-2 rounded-full">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}

          <Link href="/" className="inline-block mt-6 text-blue-600 underline">
            Back to Homepage 
          </Link>
        </div>
      </div>
    </main>
  );
}
