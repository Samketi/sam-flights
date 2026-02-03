// src/pages/BookingConfirmation.tsx
import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../api/firebase";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  User,
  Plane,
  MapPin,
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

const BookingConfirmation: FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      try {
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
        if (bookingDoc.exists()) {
          const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
          setBooking(bookingData);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Booking not found</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const flightData = JSON.parse(booking.flightData);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center mb-8"
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your flight has been successfully booked
          </p>
        </motion.div>

        {/* Booking Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-center"
        >
          <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
          <p className="text-3xl font-bold text-blue-600">
            {booking.bookingReference}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            A confirmation email has been sent to {booking.contactEmail}
          </p>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Flight Details</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold">
                  {booking.origin} → {booking.destination}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(booking.departureDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {booking.returnDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold">Return Flight</div>
                  <div className="text-sm text-gray-600">
                    {new Date(booking.returnDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold">Passengers</div>
                <div className="text-sm text-gray-600">
                  {booking.passengers.length} passenger
                  {booking.passengers.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Passengers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Passenger Information</h2>
          <div className="space-y-3">
            {booking.passengers.map((passenger: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-semibold">
                    {passenger.firstName} {passenger.lastName}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {passenger.type}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  DOB: {new Date(passenger.dateOfBirth).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Amount Paid</span>
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(booking.totalPrice, booking.currency)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Payment Reference: {booking.paymentReference}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 transition-colors"
          >
            Book Another Flight
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
