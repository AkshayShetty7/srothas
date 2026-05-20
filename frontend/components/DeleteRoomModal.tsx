"use client";
import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { roomService } from "@/services";
import { Room } from "@/types";

interface Props {
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteRoomModal({ rooms, onClose, onSuccess }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedRoomId) {
      toast.error("Please select a room to delete");
      return;
    }
    setLoading(true);
    try {
      await roomService.deleteRoom(Number(selectedRoomId));
      const room = rooms.find(r => r.id === Number(selectedRoomId));
      toast.success(`Room ${room?.room_number} deleted`);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Delete Room</h2>
              <p className="text-xs text-gray-500">Remove a room from the system</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Select Room
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all bg-white"
            >
              <option value="">-- Select a room --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number}
                </option>
              ))}
            </select>
          </div>

          {selectedRoomId && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Deleting this room will also remove all its booking records. This action cannot be undone.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !selectedRoomId}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Deleting..." : "Delete Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
