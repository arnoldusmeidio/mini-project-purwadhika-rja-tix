"use client";

import { Seat, SeatInfo } from "@/types";
import { useEffect, useState } from "react";
import { Square } from "./Square";
import { useSeatSelection } from "@/utils/hooks";
import SeatNumber from "./SeatNumber";

const groupSeatsByRow = (seats: Seat[]): Record<number, Seat[]> => {
  return seats.reduce((acc: Record<number, Seat[]>, seat: Seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});
};

export default function SelectSeats({ params }: { params: { id: string } }) {
  const [seat, setSeat] = useState<SeatInfo>();

  useEffect(() => {
    async function getSeat() {
      try {
        const seats = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/v1/showtimes/search/seats/${params.id}`,
          {
            credentials: "include",
          }
        );
        const data = await seats.json();
        setSeat(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    getSeat();
  }, []);

  const rows = groupSeatsByRow(seat?.seats || []) || [];

  const {
    state: { selectedSeats },
    toggleSeat,
    resetSeats,
  } = useSeatSelection();

  return (
    <div>
      {/* Rendering row dan kolom kursi */}
      <div>
        {Object.entries(rows).map(([rowNumber, seatsInRow]) => (
          <div className="flex gap-2 mb-2" key={rowNumber}>
            {seatsInRow.map((seat) => (
              <button
                key={`${seat.row}-${seat.column}`}
                disabled={Boolean(seat?.booked)}
                onClick={() => {
                  toggleSeat(seat);
                }}
              >
                <Square
                  key={`${seat.row}-${seat.column}`}
                  booked={Boolean(seat?.booked)}
                  selected={Boolean(
                    selectedSeats?.find(
                      (selectedSeats) =>
                        seat.column === selectedSeats.column &&
                        seat.row === selectedSeats.row
                    )
                  )}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Menunjukan kursi yg dipilih */}
      <div>
        {selectedSeats.length ? (
          <div>
            <div>Seats:</div>
            <div className="flex gap-3">
              {selectedSeats.map(({ row, column }) => (
                <SeatNumber
                  key={`${row}-${column}`}
                  row={row}
                  column={column}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Reset button untuk menghilangkan semua pilihan kursi */}
      <div className="">
        <button type="button" onClick={() => resetSeats()}>
          Reset
        </button>
      </div>
    </div>
  );
}