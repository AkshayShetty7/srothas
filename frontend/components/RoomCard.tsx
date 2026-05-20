"use client";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  DoorOpen,
} from "lucide-react";

import { Room, Booking } from "@/types";

interface Props {
  room: Room;

  currentBooking?: Booking | null;
}

export default function RoomCard({
  room,
}: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(
          `/dashboard/rooms/${room.id}`
        )
      }
      className="group bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-200"
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#f0f7ee] flex items-center justify-center group-hover:bg-[#3d6b3a]/10 transition-colors">
          <DoorOpen className="w-5 h-5 text-[#3d6b3a]" />
        </div>
      </div>

      {/* Room Number */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-medium mb-1">
          Room
        </p>

        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
          {room.room_number}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 group-hover:text-[#3d6b3a] transition-colors">
          View details
        </span>

        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#3d6b3a] group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}