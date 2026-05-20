"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  BedDouble,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";

import { isAuthenticated } from "@/lib/auth";
import { roomService, bookingService } from "@/services";

import { Room, Booking } from "@/types";

import Navbar from "@/components/Navbar";
import RoomCard from "@/components/RoomCard";

import AddRoomModal from "@/components/AddRoomModal";
import DeleteRoomModal from "@/components/DeleteRoomModal";

function isCurrentlyOccupied(booking: Booking): boolean {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const checkin = new Date(booking.checkin_date);
  const checkout = new Date(booking.checkout_date);

  return checkin <= today && today < checkout;
}

export default function DashboardPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);

  const [roomBookings, setRoomBookings] = useState<
    Record<number, Booking[]>
  >({});

  const [loading, setLoading] = useState(true);

  const [showAddRoom, setShowAddRoom] = useState(false);

  const [showDeleteRoom, setShowDeleteRoom] =
    useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);

    try {
      const roomsData = await roomService.getRooms();

      setRooms(roomsData);

      const bookingResults = await Promise.all(
        roomsData.map(async (room) => {
          try {
            const bookings =
              await bookingService.getBookings(room.id);

            return {
              roomId: room.id,
              bookings,
            };
          } catch {
            return {
              roomId: room.id,
              bookings: [],
            };
          }
        })
      );

      const bookingMap: Record<number, Booking[]> = {};

      bookingResults.forEach(({ roomId, bookings }) => {
        bookingMap[roomId] = bookings;
      });

      setRoomBookings(bookingMap);
    } catch {
      // handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const getCurrentBooking = (
    roomId: number
  ): Booking | null => {
    const bookings = roomBookings[roomId] || [];

    return bookings.find(isCurrentlyOccupied) || null;
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Room Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddRoom(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#3d6b3a] hover:bg-[#345c31] rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>

              <button
                onClick={() => setShowDeleteRoom(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Room
              </button>

              <button
                onClick={fetchRooms}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 rounded-lg transition-all"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Room Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg mb-3" />

                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />

                  <div className="h-6 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BedDouble className="w-6 h-6 text-gray-400" />
              </div>

              <p className="text-gray-500 font-medium text-sm">
                No rooms found
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Add your first room to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  currentBooking={getCurrentBooking(
                    room.id
                  )}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showAddRoom && (
        <AddRoomModal
          onClose={() => setShowAddRoom(false)}
          onSuccess={() => {
            setShowAddRoom(false);
            fetchRooms();
          }}
        />
      )}

      {showDeleteRoom && (
        <DeleteRoomModal
          rooms={rooms}
          onClose={() => setShowDeleteRoom(false)}
          onSuccess={() => {
            setShowDeleteRoom(false);
            fetchRooms();
          }}
        />
      )}
    </>
  );
}