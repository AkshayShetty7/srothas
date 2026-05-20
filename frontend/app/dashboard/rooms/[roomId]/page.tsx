"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

import {
  ArrowLeft,
  CalendarDays,
  Plus,
  User,
  Globe,
  MapPin,
  Hash,
  BedDouble,
} from "lucide-react";

import { isAuthenticated } from "@/lib/auth";
import { roomService, bookingService } from "@/services";

import { Room, Booking } from "@/types";

import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import EditBookingModal from "@/components/EditBookingModal";

// Dynamically import FullCalendar to avoid SSR issues
const RoomCalendar = dynamic(
  () => import("@/components/RoomCalendar"),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-gray-50 rounded-xl border border-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-sm text-gray-400">
          Loading calendar...
        </p>
      </div>
    ),
  }
);

function isCurrentlyOccupied(
  booking: Booking
): boolean {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const checkin = new Date(
    booking.checkin_date
  );

  const checkout = new Date(
    booking.checkout_date
  );

  return (
    checkin <= today && today < checkout
  );
}

function isUpcoming(
  booking: Booking
): boolean {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return (
    new Date(booking.checkin_date) > today
  );
}

function daysBetween(
  checkin: string,
  checkout: string
): number {
  const a = new Date(checkin);

  const b = new Date(checkout);

  return Math.round(
    (b.getTime() - a.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function RoomDetailPage() {
  const router = useRouter();

  const params = useParams();

  const roomId = Number(params.roomId);

  const [room, setRoom] =
    useState<Room | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    showBookingModal,
    setShowBookingModal,
  ] = useState(false);

  const [prefillDate, setPrefillDate] =
    useState<string | undefined>();

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<Booking | null>(null);

  const [
    editingBooking,
    setEditingBooking,
  ] = useState<Booking | null>(null);

  const [currentMonth, setCurrentMonth] =
    useState(new Date().getMonth());

  const [currentYear, setCurrentYear] =
    useState(new Date().getFullYear());

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [roomsData, bookingsData] =
        await Promise.all([
          roomService.getRooms(),
          bookingService.getBookings(
            roomId
          ),
        ]);

      const found = roomsData.find(
        (r) => r.id === roomId
      );

      if (!found) {
        router.replace("/dashboard");
        return;
      }

      setRoom(found);

      setBookings(bookingsData);
    } catch {
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentBooking =
    bookings.find(
      isCurrentlyOccupied
    );

  const filteredBookings =
    bookings.filter((booking) => {
      const checkin = new Date(
        booking.checkin_date
      );

      return (
        checkin.getMonth() ===
          currentMonth &&
        checkin.getFullYear() ===
          currentYear
      );
    });

  const handleDateClick = (
    dateStr: string
  ) => {
    setPrefillDate(dateStr);

    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />

          <div className="h-32 bg-white rounded-xl animate-pulse" />

          <div className="h-80 bg-white rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="mt-1 w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center justify-center transition-all text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Room{" "}
                  {room.room_number}
                </h1>
              </div>

              <p className="text-sm text-gray-500">
                {bookings.length}{" "}
                {bookings.length === 1
                  ? "booking"
                  : "bookings"}{" "}
                total
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPrefillDate(
                undefined
              );

              setShowBookingModal(
                true
              );
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3d6b3a] text-white text-sm font-semibold rounded-lg hover:bg-[#2d5228] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Book Room
          </button>
        </div>

        {/* Current occupant */}
        {currentBooking && (
          <div className="bg-[#3d6b3a] text-white rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-0.5">
                  Currently Staying
                </p>

                <p className="font-bold text-white">
                  {currentBooking.name}
                </p>

                <p className="text-sm text-white/70">
                  {
                    currentBooking.nationality
                  }{" "}
                  ·{" "}
                  {daysBetween(
                    currentBooking.checkin_date,
                    currentBooking.checkout_date
                  )}{" "}
                  {daysBetween(
                    currentBooking.checkin_date,
                    currentBooking.checkout_date
                  ) === 1
                    ? "day"
                    : "days"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-white/60 uppercase tracking-wider mb-0.5">
                Check-out
              </p>

              <p className="font-bold text-white">
                {new Date(
                  currentBooking.checkout_date
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-[#3d6b3a]" />

            <h2 className="font-semibold text-gray-900 text-sm">
              Booking Calendar
            </h2>

            <p className="text-xs text-gray-400 ml-1">
              · Click a date to
              book
            </p>

            <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#3d6b3a] inline-block" />
                Booked
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#3d6b3a] inline-block" />
                Today
              </span>
            </div>
          </div>

          <RoomCalendar
            bookings={bookings}
            onDateClick={
              handleDateClick
            }
            onBookingClick={(
              booking
            ) =>
              setEditingBooking(
                booking
              )
            }
            onMonthChange={(
              date
            ) => {
              setCurrentMonth(
                date.getMonth()
              );

              setCurrentYear(
                date.getFullYear()
              );
            }}
          />
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">
            Bookings (
            {
              filteredBookings.length
            }
            )
          </h2>

          {filteredBookings.length ===
          0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <CalendarDays className="w-5 h-5 text-gray-400" />
              </div>

              <p className="text-sm text-gray-400">
                No bookings for this
                month
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[
                ...filteredBookings,
              ]
                .sort(
                  (a, b) =>
                    new Date(a.checkin_date).getTime() -
                    new Date(b.checkin_date).getTime()
                )
                .map((booking) => {
                  const current =
                    isCurrentlyOccupied(
                      booking
                    );

                  const upcoming =
                    isUpcoming(
                      booking
                    );

                  const days =
                    daysBetween(
                      booking.checkin_date,
                      booking.checkout_date
                    );

                  return (
                    <div
                      key={
                        booking.id
                      }
                      onClick={() =>
                        setSelectedBooking(
                          selectedBooking?.id ===
                            booking.id
                            ? null
                            : booking
                        )
                      }
                      className="border border-gray-100 rounded-xl p-3.5 cursor-pointer hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f0f7ee] flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#3d6b3a]" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">
                                {
                                  booking.name
                                }
                              </p>

                              {current && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#3d6b3a] text-white rounded-md">
                                  Current
                                </span>
                              )}

                              {upcoming && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500 text-white rounded-md">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-400">
                              {new Date(
                                booking.checkin_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  month:
                                    "short",
                                  day: "numeric",
                                }
                              )}

                              {" → "}

                              {new Date(
                                booking.checkout_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  month:
                                    "short",
                                  day: "numeric",
                                  year:
                                    "numeric",
                                }
                              )}

                              {" · "}

                              {days}{" "}
                              {days ===
                              1
                                ? "day"
                                : "days"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {selectedBooking?.id ===
                        booking.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Hash className="w-3 h-3 text-gray-400" />

                            <span>
                              Age:{" "}
                              {
                                booking.age
                              }
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Globe className="w-3 h-3 text-gray-400" />

                            <span>
                              {
                                booking.nationality
                              }
                            </span>
                          </div>

                          <div className="flex items-start gap-2 text-xs text-gray-600 col-span-2">
                            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />

                            <span>
                              {
                                booking.address
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {showBookingModal && room && (
        <BookingModal
          roomId={room.id}
          roomNumber={
            room.room_number
          }
          prefillCheckin={
            prefillDate
          }
          onClose={() => {
            setShowBookingModal(
              false
            );

            setPrefillDate(
              undefined
            );
          }}
          onSuccess={() => {
            setShowBookingModal(
              false
            );

            setPrefillDate(
              undefined
            );

            fetchData();
          }}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() =>
            setEditingBooking(
              null
            )
          }
          onSuccess={() => {
            setEditingBooking(
              null
            );

            fetchData();
          }}
        />
      )}
    </div>
  );
}