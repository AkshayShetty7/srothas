"use client";
import { useState } from "react";
import { X, CalendarDays, User, Globe, MapPin, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { bookingService } from "@/services";
import { BookingPayload } from "@/types";

interface Props {
  roomId: number;
  roomNumber: string;
  prefillCheckin?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ roomId, roomNumber, prefillCheckin, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<Omit<BookingPayload, "room_id">>({
    name: "",
    age: 0,
    nationality: "",
    address: "",
    checkin_date: prefillCheckin || "",
    checkout_date: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, age, nationality, address, checkin_date, checkout_date } = form;
    if (!name || !age || !nationality || !address || !checkin_date || !checkout_date) {
      toast.error("Please fill in all fields");
      return;
    }
    if (age < 1 || age > 120) {
      toast.error("Please enter a valid age");
      return;
    }
    setLoading(true);
    try {
      await bookingService.createBooking({ ...form, room_id: roomId });
      toast.success("Booking confirmed!");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f0f7ee] flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#3d6b3a]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">New Booking</h2>
              <p className="text-xs text-gray-500">Room {roomNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Guest Info Section */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guest Information</p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <User className="w-3 h-3 inline mr-1" />Full Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Patient's full name"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Hash className="w-3 h-3 inline mr-1" />Age *
              </label>
              <input
                type="number"
                value={form.age || ""}
                onChange={(e) => set("age", parseInt(e.target.value) || 0)}
                placeholder="35"
                min={1}
                max={120}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Globe className="w-3 h-3 inline mr-1" />Nationality *
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
                placeholder="Indian"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" />Address *
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full address"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
            />
          </div>

          {/* Stay Details */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">Stay Details</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Check-in *
              </label>
              <input
                type="date"
                value={form.checkin_date}
                onChange={(e) => set("checkin_date", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Check-out *
              </label>
              <input
                type="date"
                value={form.checkout_date}
                onChange={(e) => set("checkout_date", e.target.value)}
                min={form.checkin_date || undefined}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-[#3d6b3a] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5228] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
