export interface Room {
  id: number;
  room_number: string;
  bookings?: Booking[];
}

export interface Booking {
  id: number;
  room_id: number;
  name: string;
  age: number;
  nationality: string;
  address: string;
  checkin_date: string;
  checkout_date: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface BookingPayload {
  room_id: number;
  name: string;
  age: number;
  nationality: string;
  address: string;
  checkin_date: string;
  checkout_date: string;
}

export interface PasswordChangePayload {
  old_password: string;
  new_password: string;
}
