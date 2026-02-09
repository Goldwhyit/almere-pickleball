import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/auth";

interface AvailableDate {
  date: string;
  time: string;
  endTime: string;
  location: string;
  address: string;
  dayName: string;
  booked?: number;
  capacity?: number;
}

interface LessonSchedulerProps {
  onBookLesson?: (
    date: string,
    time: string,
    location: string,
  ) => Promise<void>;
  canBook?: boolean;
  maxBookings?: number;
  isMemberWithPunchCard?: boolean;
  isRegistrationMode?: boolean; // For non-punch card members
  existingBookings?: Array<{
    id?: string;
    date: string;
    time: string;
    location: string;
  }>;
  showBookedSummary?: boolean;
  requiresPayment?: boolean;
  pricePerSession?: number;
  memberCredit?: number;
  onCreditUpdate?: (newCredit: number) => void;
  onCancelBooking?: (bookingId: string) => Promise<void>;
  canCancelBooking?: (date: string, time: string) => boolean;
}

export const LessonScheduler: React.FC<LessonSchedulerProps> = ({
  onBookLesson,
  canBook = true,
  maxBookings = 1,
  isMemberWithPunchCard = false,
  isRegistrationMode: _isRegistrationMode = false, // Voor toekomstig gebruik
  existingBookings = [],
  showBookedSummary = true,
  requiresPayment = false,
  pricePerSession = 8.5,
  memberCredit = 0,
  onCreditUpdate,
  onCancelBooking,
  canCancelBooking,
}) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<
    Array<{ date: string; time: string; location: string; id?: string }>
  >([]);
  const [hasBooked, setHasBooked] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<
    Array<{ date: string; time: string; location: string }>
  >([]);
  const prevBookingCountRef = useRef(existingBookings.length);

  // Load available dates
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/trial-lessons/available-dates",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setAvailableDates(data);
        } else {
          setAvailableDates([]);
          setError("Geen beschikbare datums gevonden");
        }
      } catch (err) {
        setError("Kon beschikbare datums niet laden");
        setAvailableDates([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  // Update lock state based on active (today or future) bookings
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasActiveBooking = existingBookings.some((b) => {
      const bookingDate = new Date(`${b.date}T00:00:00`);
      return bookingDate >= today;
    });

    setHasBooked(hasActiveBooking);

    if (!hasActiveBooking) {
      setSelectedDates([]);
      setSuccess(false);
    }

    prevBookingCountRef.current = existingBookings.length;
  }, [existingBookings]);

  const handleDateSelect = (dateData: AvailableDate) => {
    if (!canBook) return;
    if (hasBooked) {
      setError(
        "Je hebt al geboekt. Je kan datums alleen via je dashboard annuleren.",
      );
      return;
    }

    const dateKey = `${dateData.date}|${dateData.time}|${dateData.location}`;
    const isSelected = selectedDates.some(
      (d) => `${d.date}|${d.time}|${d.location}` === dateKey,
    );
    const isAlreadyBooked = existingBookings.some(
      (b) => `${b.date}|${b.time}|${b.location}` === dateKey,
    );

    if (isAlreadyBooked && !isSelected) {
      setError(
        "Je hebt deze datum al geboekt. Annuleer deze eerst om opnieuw in te schrijven.",
      );
      return;
    }

    if (isSelected) {
      // Deselect: decrease booked count
      setSelectedDates(
        selectedDates.filter(
          (d) => `${d.date}|${d.time}|${d.location}` !== dateKey,
        ),
      );
      setAvailableDates((prev) =>
        prev.map((slot) =>
          `${slot.date}|${slot.time}|${slot.location}` === dateKey &&
          slot.booked !== undefined
            ? { ...slot, booked: Math.max(0, slot.booked - 1) }
            : slot,
        ),
      );
    } else if (selectedDates.length < maxBookings) {
      // Select: increase booked count
      setError(""); // Clear any previous errors
      setSelectedDates([
        ...selectedDates,
        {
          date: dateData.date,
          time: dateData.time,
          location: dateData.location,
        },
      ]);
      setAvailableDates((prev) =>
        prev.map((slot) =>
          `${slot.date}|${slot.time}|${slot.location}` === dateKey &&
          slot.booked !== undefined
            ? { ...slot, booked: slot.booked + 1 }
            : slot,
        ),
      );
    } else {
      setError(`Je mag maximaal ${maxBookings} training(en) boeken`);
    }
  };

  const performBooking = async (
    bookingsToProcess: Array<{ date: string; time: string; location: string }>,
  ) => {
    if (bookingsToProcess.length === 0) {
      setError("Selecteer minstens één trainingsdag");
      return;
    }

    setLoading(true);
    try {
      let updatedPunchCardCount = 0;

      for (const booking of bookingsToProcess) {
        if (isMemberWithPunchCard) {
          // For punch card members, call the training booking endpoint
          const response = await fetch(
            "http://localhost:3000/api/trial-lessons/book-training",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              body: JSON.stringify({
                date: booking.date,
                time: booking.time,
                location: booking.location,
              }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Boeking mislukt");
          }

          const result = await response.json();
          updatedPunchCardCount = result.punchCardCount;
        } else {
          // For regular members (MONTHLY, YEARLY, etc.), use registration endpoint
          const response = await fetch(
            "http://localhost:3000/api/trial-lessons/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              body: JSON.stringify({
                date: booking.date,
                time: booking.time,
                location: booking.location,
              }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Inschrijving mislukt");
          }

          const result = await response.json();

          // Update credit if returned
          if (result.credit !== undefined && onCreditUpdate) {
            onCreditUpdate(result.credit);
          }

          if (onBookLesson) {
            await onBookLesson(booking.date, booking.time, booking.location);
          }
        }
      }

      // Update auth store with new punch card count for members
      if (isMemberWithPunchCard && updatedPunchCardCount !== undefined) {
        const user = useAuthStore.getState().user;
        if (user?.member) {
          setAuth(
            {
              ...user,
              member: {
                ...user.member,
                punchCardCount: updatedPunchCardCount,
              },
            },
            localStorage.getItem("accessToken") || "",
          );
        }
      }

      setSuccess(true);
      setHasBooked(true);
      setError("");

      // Clear selections after success message shows, and auto-hide success after 3 seconds
      setTimeout(() => {
        setSelectedDates([]);
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (isMemberWithPunchCard ? "Boeking mislukt" : "Inschrijving mislukt");
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : isMemberWithPunchCard
            ? "Boeking mislukt"
            : "Inschrijving mislukt",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (selectedDates.length === 0) {
      setError("Selecteer minstens één trainingsdag");
      return;
    }

    if (requiresPayment && !isMemberWithPunchCard) {
      const totalCost = selectedDates.length * pricePerSession;
      const remainingCost = Math.max(0, totalCost - memberCredit);

      // If credit covers full amount, proceed directly
      if (remainingCost === 0) {
        await performBooking(selectedDates);
        return;
      }

      // Otherwise show payment modal for remaining amount
      setPendingBookings(selectedDates);
      setShowPayment(true);
      return;
    }

    await performBooking(selectedDates);
  };

  // Group dates by location
  const groupedByLocation: Record<string, AvailableDate[]> = {};
  availableDates.forEach((slot) => {
    if (!groupedByLocation[slot.location]) {
      groupedByLocation[slot.location] = [];
    }
    groupedByLocation[slot.location].push(slot);
  });

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Beschikbare datums laden...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              💳 Betaling vereist
            </h4>

            {(() => {
              const totalCost = pendingBookings.length * pricePerSession;
              const creditUsed = Math.min(memberCredit, totalCost);
              const remainingCost = totalCost - creditUsed;

              return (
                <>
                  <p className="text-sm text-gray-700 mb-2">
                    Je hebt {pendingBookings.length} training(en) geselecteerd.
                  </p>

                  <div className="bg-gray-50 rounded p-3 mb-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Totaal:</span>
                      <span>€{totalCost.toFixed(2)}</span>
                    </div>
                    {creditUsed > 0 && (
                      <div className="flex justify-between text-green-700 font-medium">
                        <span>Tegoed gebruikt:</span>
                        <span>- €{creditUsed.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                      <span>Te betalen:</span>
                      <span>€{remainingCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Dit is een testbetaling. Bij annuleren wordt er niets
                    opgeslagen.
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowPayment(false);
                        setPendingBookings([]);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                    >
                      Annuleer
                    </button>
                    <button
                      onClick={async () => {
                        setShowPayment(false);
                        await performBooking(pendingBookings);
                        setPendingBookings([]);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Betaal nu
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="font-semibold text-lg">
            ✓ Training(en) succesvol{" "}
            {isMemberWithPunchCard ? "geboekt!" : "ingeschreven!"}
          </div>
          {isMemberWithPunchCard && (
            <div className="text-sm mt-2">
              Je strippenkaart is bijgewerkt. Alle datums zijn nu vergrendeld.
            </div>
          )}
          <div className="text-sm mt-2 text-green-600">
            Message verdwijnt over 3 seconden...
          </div>
        </div>
      )}

      {/* Selection Summary - MOVED TO TOP */}
      {(() => {
        const isSelectionSummary = selectedDates.length > 0;
        const summaryBookings = isSelectionSummary
          ? selectedDates
          : showBookedSummary
            ? existingBookings
            : [];

        if (summaryBookings.length === 0) return null;

        return (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
            <div className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📅</span>
              {isSelectionSummary
                ? `Je hebt ${summaryBookings.length} training(en) geselecteerd:`
                : `Je hebt ${summaryBookings.length} training(en) geboekt:`}
            </div>
            <div className="space-y-2">
              {summaryBookings.map((booking, idx) => {
                const slot = availableDates.find(
                  (d) =>
                    d.date === booking.date &&
                    d.location === booking.location &&
                    d.time === booking.time,
                );
                const dateObj = new Date(`${booking.date}T00:00:00`);
                const dateStr = dateObj.toLocaleDateString("nl-NL", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });
                const registrationCount = slot?.booked || 0;
                const capacity = slot?.capacity || 0;
                const canCancel =
                  !isSelectionSummary && canCancelBooking
                    ? canCancelBooking(booking.date, booking.time)
                    : false;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded p-3 border-l-4 border-blue-500 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900 text-sm">
                        {dateStr} · {booking.time}-{slot?.endTime || ""}
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        📍 {booking.location}
                      </div>
                      <div className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded inline-block mt-2">
                        👥 {registrationCount}
                        {capacity ? `/${capacity}` : ""} ingeschreven
                      </div>
                    </div>
                    {isSelectionSummary ? (
                      <button
                        onClick={() => {
                          const dateKey = `${booking.date}|${booking.time}|${booking.location}`;
                          setSelectedDates(
                            selectedDates.filter(
                              (d) =>
                                `${d.date}|${d.time}|${d.location}` !== dateKey,
                            ),
                          );
                          setAvailableDates((prev) =>
                            prev.map((s) =>
                              `${s.date}|${s.time}|${s.location}` === dateKey &&
                              s.booked !== undefined
                                ? { ...s, booked: Math.max(0, s.booked - 1) }
                                : s,
                            ),
                          );
                        }}
                        className="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition"
                        title="Verwijder deze selectie"
                      >
                        ✕
                      </button>
                    ) : onCancelBooking && booking.id ? (
                      <div className="ml-2 flex flex-col items-end gap-1">
                        {!canCancel && (
                          <span className="text-xs text-gray-500">
                            Annuleren tot 4 uur voor start
                          </span>
                        )}
                        <button
                          onClick={() => onCancelBooking(booking.id!)}
                          disabled={!canCancel}
                          className={`px-3 py-1 text-xs font-semibold rounded transition ${
                            canCancel
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Annuleer
                        </button>
                      </div>
                    ) : (
                      <div className="ml-2 text-xs text-gray-500">🔒</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Locations with Dates */}
      <div className="space-y-6">
        <h4 className="font-semibold text-gray-900">
          Selecteer trainingsdata:
        </h4>

        {Object.entries(groupedByLocation).map(([location, dates]) => (
          <div
            key={location}
            className="border-2 border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Location Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <h3 className="font-bold text-lg mb-1">{location}</h3>
              <p className="text-sm text-blue-100">
                ⏰ {dates[0].time}-{dates[0].endTime}
              </p>
              <p className="text-sm text-blue-100">📍 {dates[0].address}</p>
            </div>

            {/* Dates Grid */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {dates.map((slot) => {
                  const dateKey = `${slot.date}|${slot.time}|${slot.location}`;
                  const isSelected = selectedDates.some(
                    (d) => `${d.date}|${d.time}|${d.location}` === dateKey,
                  );
                  const isAlreadyBooked = existingBookings.some(
                    (b) => `${b.date}|${b.time}|${b.location}` === dateKey,
                  );

                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDateSelect(slot)}
                      disabled={!canBook || isAlreadyBooked}
                      className={`
                        p-3 rounded-lg font-medium transition-all border-2 relative
                        ${
                          isSelected
                            ? "bg-green-500 text-white border-green-600 shadow-md"
                            : isAlreadyBooked
                              ? "bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed"
                              : "bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-sm"
                        }
                        ${!canBook && !isAlreadyBooked ? "opacity-50 cursor-not-allowed" : isAlreadyBooked ? "" : "cursor-pointer"}
                      `}
                      title={
                        isAlreadyBooked
                          ? "Deze datum is al door jou geboekt"
                          : ""
                      }
                    >
                      <div className="font-semibold">
                        {slot.date &&
                          new Date(`${slot.date}T00:00:00`).toLocaleDateString(
                            "nl-NL",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            },
                          )}
                      </div>
                      <div className="text-xs mt-1 opacity-75">
                        {typeof slot.dayName === "string" ? slot.dayName : ""}
                      </div>
                      {/* Registration Counter */}
                      {slot.booked !== undefined &&
                        slot.capacity !== undefined && (
                          <div
                            className={`text-xs mt-2 px-2 py-1 rounded ${
                              slot.booked >= slot.capacity * 0.8
                                ? "bg-red-100 text-red-800"
                                : slot.booked >= slot.capacity * 0.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {typeof slot.booked === "number" &&
                            typeof slot.capacity === "number"
                              ? `${slot.booked}/${slot.capacity} vol`
                              : "Onbekend"}
                          </div>
                        )}
                      {isSelected && <div className="text-xs mt-1">✓</div>}
                      {isAlreadyBooked && !isSelected && (
                        <div className="text-xs mt-1">🔒</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Book Button */}
      {canBook && (
        <button
          onClick={handleBook}
          disabled={selectedDates.length === 0 || loading}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold transition-all
            ${
              selectedDates.length > 0 && !loading
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {loading
            ? "Bezig met boeking..."
            : `Boek ${selectedDates.length} training(en)`}
        </button>
      )}
    </div>
  );
};
