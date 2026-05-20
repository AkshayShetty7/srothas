"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { Booking } from "@/types";

interface RoomCalendarProps {
  bookings: Booking[];

  onDateClick?: (dateStr: string) => void;

  onBookingClick?: (booking: Booking) => void;

  onMonthChange?: (date: Date) => void;
}

export default function RoomCalendar({
  bookings,
  onDateClick,
  onBookingClick,
  onMonthChange,
}: RoomCalendarProps) {
  const events = bookings.map((booking) => ({
    id: booking.id.toString(),

    title: booking.name,

    start: booking.checkin_date,

    end: booking.checkout_date,

    backgroundColor: "#3d6b3a",

    borderColor: "#3d6b3a",

    textColor: "#ffffff",

    extendedProps: {
      booking,
    },
  }));

  return (
    <div className="fc-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        selectable
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
        }}
        dateClick={(info) => {
          onDateClick?.(info.dateStr);
        }}
        eventClick={(info) => {
          const booking =
            info.event.extendedProps.booking;

          onBookingClick?.(booking);
        }}
        datesSet={(arg) => {
          const currentDate =
            arg.view.calendar.getDate();

          onMonthChange?.(currentDate);
        }}
      />
    </div>
  );
}