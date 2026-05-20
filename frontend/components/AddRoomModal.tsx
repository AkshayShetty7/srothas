"use client";
import { useState } from "react";
import { X, DoorOpen } from "lucide-react";
import toast from "react-hot-toast";
import { roomService } from "@/services";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRoomModal({ onClose, onSuccess }: Props) {
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      toast.error("Please enter a room number");
      return;
    }
    setLoading(true);
    try {
      await roomService.createRoom(roomNumber.trim());
      toast.success(`Room ${roomNumber} created`);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f0f7ee] flex items-center justify-center">
              <DoorOpen className="w-4 h-4 text-[#3d6b3a]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Add New Room</h2>
              <p className="text-xs text-gray-500">Register a room in the system</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101, A2, P01"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a] transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-[#3d6b3a] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5228] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
