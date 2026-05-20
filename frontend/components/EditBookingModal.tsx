"use client";

import { useState } from "react";

import {
  X,
  Trash2,
  Save,
} from "lucide-react";

import { Booking } from "@/types";

import { bookingService } from "@/services";

interface Props {
  booking: Booking;

  onClose: () => void;

  onSuccess: () => void;
}

export default function EditBookingModal({
  booking,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(
    booking.name
  );

  const [age, setAge] = useState(
    booking.age
  );

  const [nationality, setNationality] =
    useState(booking.nationality);

  const [address, setAddress] = useState(
    booking.address
  );

  const [checkinDate, setCheckinDate] =
    useState(booking.checkin_date);

  const [checkoutDate, setCheckoutDate] =
    useState(booking.checkout_date);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleUpdate = async () => {
    try {
      setLoading(true);

      setError("");

      await bookingService.updateBooking(
        booking.id,
        {
          room_id: booking.room_id,
          name,
          age,
          nationality,
          address,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
        }
      );

      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Failed to update booking"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this booking?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      setError("");

      await bookingService.deleteBooking(
        booking.id
      );

      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Failed to delete booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Booking
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Guest Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Age
            </label>

            <input
              type="number"
              value={age}
              onChange={(e) =>
                setAge(
                  Number(e.target.value)
                )
              }
              placeholder="Age"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Nationality
            </label>

            <input
              value={nationality}
              onChange={(e) =>
                setNationality(
                  e.target.value
                )
              }
              placeholder="Nationality"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Address
            </label>

            <input
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="Address"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Check-in
              </label>

              <input
                type="date"
                value={checkinDate}
                onChange={(e) =>
                  setCheckinDate(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Check-out
              </label>

              <input
                type="date"
                value={checkoutDate}
                onChange={(e) =>
                  setCheckoutDate(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b3a]/20 focus:border-[#3d6b3a]"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3d6b3a] text-white hover:bg-[#2d5228] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />

            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}