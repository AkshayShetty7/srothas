import api from "@/lib/api";

import {
  LoginPayload,
  Room,
  Booking,
  BookingPayload,
  PasswordChangePayload,
} from "@/types";

export const authService = {
  login: async (data: LoginPayload) => {
    const res = await api.post(
      "/login",
      data
    );

    return res.data;
  },

  changePassword: async (
    data: PasswordChangePayload
  ) => {
    const res = await api.post(
      "/change-password",
      data
    );

    return res.data;
  },
};

export const roomService = {
  getRooms: async (): Promise<Room[]> => {
    const res = await api.get("/rooms");

    return res.data;
  },

  createRoom: async (
    room_number: string
  ) => {
    const res = await api.post(
      "/rooms",
      { room_number }
    );

    return res.data;
  },

  deleteRoom: async (
    roomId: number
  ) => {
    const res = await api.delete(
      `/rooms/${roomId}`
    );

    return res.data;
  },
};

export const bookingService = {
  getBookings: async (
    roomId: number
  ): Promise<Booking[]> => {
    const res = await api.get(
      `/bookings/${roomId}`
    );

    return res.data;
  },

  createBooking: async (
    data: BookingPayload
  ) => {
    const res = await api.post(
      "/bookings",
      data
    );

    return res.data;
  },

  updateBooking: async (
    bookingId: number,
    data: BookingPayload
  ) => {
    const res = await api.put(
      `/bookings/${bookingId}`,
      data
    );

    return res.data;
  },

  deleteBooking: async (
    bookingId: number
  ) => {
    const res = await api.delete(
      `/bookings/${bookingId}`
    );

    return res.data;
  },
};