// src/pages/MyBookings.tsx
import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Mail,
} from "lucide-react";
import {
  cancelBooking,
  getUserBookings,
  type BookingData,
  type Passenger,
} from "../../api/firestoreBooking";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";

type BookingStatus = "all" | "confirmed" | "pending" | "cancelled";

const MyBookings: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [bookings, setBookings] = useState<(BookingData & { id: string })[]>(
    [],
  );
  const [filteredBookings, setFilteredBookings] = useState<
    (BookingData & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userBookings = await getUserBookings(user.uid);
      setBookings(userBookings as (BookingData & { id: string })[]);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === statusFilter));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelling(bookingId);
      await cancelBooking(bookingId);

      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
        ),
      );
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const toggleBookingExpanded = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    const totalMinutes = hours * 60 + minutes;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Error Loading Bookings
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchBookings}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your flight reservations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">
              Filter by Status
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "confirmed", "pending", "cancelled"] as BookingStatus[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all" && ` (${bookings.length})`}
                {status !== "all" &&
                  ` (${bookings.filter((b) => b.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h2>
            <p className="text-gray-600 mb-6">
              {statusFilter === "all"
                ? "You haven't made any bookings yet."
                : `You don't have any ${statusFilter} bookings.`}
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Book a Flight
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((booking) => {
                const isExpanded = expandedBooking === booking.id;
                const flightData = JSON.parse(booking.flightData);
                const isPastFlight =
                  new Date(booking.departureDate) < new Date();
                const isRoundTrip = !!booking.returnDate;

                // Parse flight itineraries
                const outbound = flightData.itineraries[0];
                const returnFlight = isRoundTrip
                  ? flightData.itineraries[1]
                  : null;
                const outboundStops = outbound.segments.length - 1;
                const returnStops = returnFlight
                  ? returnFlight.segments.length - 1
                  : 0;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Booking Card Header */}
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        {/* Route Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Plane className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">
                              {booking.origin} → {booking.destination}
                              {isRoundTrip && (
                                <span className="text-blue-600 text-sm ml-2">
                                  (Round Trip)
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                {booking.passengers.length} passenger
                                {booking.passengers.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Price */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">
                              Total Price
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatPrice(
                                booking.totalPrice,
                                booking.currency,
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="font-semibold capitalize">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details - OUTBOUND */}
                      <div className="mb-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                            OUTBOUND
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(booking.departureDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-center">
                          {/* Departure */}
                          <div>
                            <div className="text-xl font-bold text-gray-900">
                              {formatTime(outbound.segments[0].departure.at)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {outbound.segments[0].departure.iataCode}
                            </div>
                          </div>

                          {/* Duration & Stops */}
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">
                              {formatDuration(outbound.duration)}
                            </div>
                            <div className="flex items-center justify-center mb-1">
                              <div className="h-px bg-gray-300 flex-1"></div>
                              <Plane className="w-4 h-4 text-gray-400 mx-2" />
                              <div className="h-px bg-gray-300 flex-1"></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {outboundStops === 0
                                ? "Non-stop"
                                : `${outboundStops} stop${outboundStops > 1 ? "s" : ""}`}
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatTime(
                                outbound.segments[outbound.segments.length - 1]
                                  .arrival.at,
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {
                                outbound.segments[outbound.segments.length - 1]
                                  .arrival.iataCode
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details - RETURN (if round trip) */}
                      {isRoundTrip && returnFlight && (
                        <div className="mb-4 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                              RETURN
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(booking.returnDate!).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 items-center">
                            {/* Departure */}
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {formatTime(
                                  returnFlight.segments[0].departure.at,
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {returnFlight.segments[0].departure.iataCode}
                              </div>
                            </div>

                            {/* Duration & Stops */}
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">
                                {formatDuration(returnFlight.duration)}
                              </div>
                              <div className="flex items-center justify-center mb-1">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <Plane className="w-4 h-4 text-gray-400 mx-2 transform rotate-180" />
                                <div className="h-px bg-gray-300 flex-1"></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {returnStops === 0
                                  ? "Non-stop"
                                  : `${returnStops} stop${returnStops > 1 ? "s" : ""}`}
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {formatTime(
                                  returnFlight.segments[
                                    returnFlight.segments.length - 1
                                  ].arrival.at,
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {
                                  returnFlight.segments[
                                    returnFlight.segments.length - 1
                                  ].arrival.iataCode
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Booking Reference */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-600">
                            Booking Reference:{" "}
                          </span>
                          <span className="font-bold text-gray-900">
                            {booking.bookingReference}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Booked on{" "}
                          {booking.createdAt.toDate().toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => toggleBookingExpanded(booking.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </button>

                        {booking.status === "confirmed" && !isPastFlight && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelling === booking.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {cancelling === booking.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Cancel Booking
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            navigate(`/booking-confirmation/${booking.id}`)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          View Confirmation
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200"
                        >
                          <div className="p-6 bg-gray-50 space-y-6">
                            {/* Flight Segments - OUTBOUND */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">
                                Outbound Flight Segments
                              </h4>
                              <div className="space-y-2">
                                {outbound.segments.map(
                                  (segment: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="bg-white rounded-lg p-3 text-sm"
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">
                                          {segment.departure.iataCode}{" "}
                                          {formatTime(segment.departure.at)}
                                        </span>
                                        <span className="text-gray-600">
                                          {formatDuration(segment.duration)}
                                        </span>
                                        <span className="font-semibold">
                                          {segment.arrival.iataCode}{" "}
                                          {formatTime(segment.arrival.at)}
                                        </span>
                                      </div>
                                      <div className="text-gray-500">
                                        Flight {segment.carrierCode}{" "}
                                        {segment.number}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {/* Flight Segments - RETURN */}
                            {isRoundTrip && returnFlight && (
                              <div>
                                <h4 className="font-bold text-gray-900 mb-3">
                                  Return Flight Segments
                                </h4>
                                <div className="space-y-2">
                                  {returnFlight.segments.map(
                                    (segment: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="bg-white rounded-lg p-3 text-sm"
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-semibold">
                                            {segment.departure.iataCode}{" "}
                                            {formatTime(segment.departure.at)}
                                          </span>
                                          <span className="text-gray-600">
                                            {formatDuration(segment.duration)}
                                          </span>
                                          <span className="font-semibold">
                                            {segment.arrival.iataCode}{" "}
                                            {formatTime(segment.arrival.at)}
                                          </span>
                                        </div>
                                        <div className="text-gray-500">
                                          Flight {segment.carrierCode}{" "}
                                          {segment.number}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Passenger Information */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">
                                Passenger Details
                              </h4>
                              <div className="space-y-2">
                                {booking.passengers.map(
                                  (passenger: Passenger, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-lg p-3 flex justify-between items-center"
                                    >
                                      <div>
                                        <div className="font-semibold">
                                          {passenger.firstName}{" "}
                                          {passenger.lastName}
                                        </div>
                                        <div className="text-sm text-gray-600 capitalize">
                                          {passenger.type}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        DOB:{" "}
                                        {new Date(
                                          passenger.dateOfBirth,
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">
                                Contact Information
                              </h4>
                              <div className="bg-white rounded-lg p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      Email
                                    </div>
                                    <div className="font-medium">
                                      {booking.contactEmail}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      Phone
                                    </div>
                                    <div className="font-medium">
                                      {booking.contactPhone}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Information */}
                            {booking.paymentReference && (
                              <div>
                                <h4 className="font-bold text-gray-900 mb-3">
                                  Payment Information
                                </h4>
                                <div className="bg-white rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="text-sm text-gray-600">
                                        Payment Reference
                                      </div>
                                      <div className="font-medium">
                                        {booking.paymentReference}
                                      </div>
                                    </div>
                                    <div
                                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        booking.paymentStatus === "completed"
                                          ? "bg-green-100 text-green-700"
                                          : booking.paymentStatus === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {booking.paymentStatus.toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
