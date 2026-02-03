// src/pages/Booking.tsx
import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { initializePayment } from "../../api/paystack";
import { motion } from "framer-motion";
import {
  Plane,
  User,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { createBooking, updateBookingPayment, type Passenger } from "../../api/firestoreBooking";

const Booking: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice, selectedCurrency, convertPrice } = useCurrency();

  // Get flight data from session storage
  const [flightInfo, setFlightInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const savedFlight = sessionStorage.getItem("selectedFlight");
    if (!savedFlight) {
      navigate("/");
      return;
    }

    const data = JSON.parse(savedFlight);
    setFlightInfo(data);

    // Initialize passenger forms based on search params
    const totalPassengers =
      data.searchParams.adults +
      (data.searchParams.children || 0) +
      (data.searchParams.infants || 0);

    const initialPassengers: Passenger[] = [];

    // Add adults
    for (let i = 0; i < data.searchParams.adults; i++) {
      initialPassengers.push({
        type: "adult",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "",
      });
    }

    // Add children
    for (let i = 0; i < (data.searchParams.children || 0); i++) {
      initialPassengers.push({
        type: "child",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "",
      });
    }

    // Add infants
    for (let i = 0; i < (data.searchParams.infants || 0); i++) {
      initialPassengers.push({
        type: "infant",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "",
      });
    }

    setPassengers(initialPassengers);
  }, [navigate]);

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validateForm = (): boolean => {
    // Check contact info
    if (!contactEmail || !contactPhone) {
      setError("Please provide contact email and phone number");
      return false;
    }

    // Check all passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.dateOfBirth) {
        setError(`Please complete all required fields for passenger ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert price to selected currency
      const priceInSelectedCurrency = convertPrice(
        parseFloat(flightInfo.flight.price.total),
        flightInfo.flight.price.currency,
      );

      // Create booking in Firestore first
      const bookingId = await createBooking({
        userId: user.uid,
        userEmail: user.email || "",
        flightId: flightInfo.flight.id,
        origin: flightInfo.searchParams.origin,
        destination: flightInfo.searchParams.destination,
        departureDate: flightInfo.searchParams.departureDate,
        returnDate: flightInfo.searchParams.returnDate,
        passengers,
        totalPrice: priceInSelectedCurrency,
        currency: selectedCurrency.code,
        contactEmail,
        contactPhone,
        paymentStatus: "pending",
        flightData: JSON.stringify(flightInfo.flight),
        status: "pending",
      });

      // Initialize Paystack payment
      const paymentReference = `PAY-${Date.now()}-${bookingId}`;

      // Convert to kobo (or smallest currency unit)
      const amountInMinorUnits = Math.round(priceInSelectedCurrency * 100);

      const paymentResponse = await initializePayment({
        email: contactEmail,
        amount: amountInMinorUnits,
        currency: selectedCurrency.code,
        reference: paymentReference,
        metadata: {
          bookingId,
          flightId: flightInfo.flight.id,
          passengers: passengers.length,
        },
      });

      // Payment successful - update booking
      if (paymentResponse.status === "success") {
        // In production, verify payment on backend before updating
        await updateBookingPayment(bookingId, "completed", paymentReference);

        // Clear session storage
        sessionStorage.removeItem("selectedFlight");

        // Navigate to confirmation page
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to complete booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!flightInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { flight, dictionaries, searchParams } = flightInfo;
  const outbound = flight.itineraries[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Results
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-2">
            {searchParams.origin} → {searchParams.destination}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+27 123 456 7890"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Your booking confirmation will be sent to this email address.
              </p>
            </div>

            {/* Passenger Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Passenger Details
              </h2>

              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="mb-6 pb-6 border-b border-gray-200 last:border-b-0"
                >
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Passenger {index + 1} (
                    {passenger.type.charAt(0).toUpperCase() +
                      passenger.type.slice(1)}
                    )
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) =>
                          updatePassenger(index, "firstName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) =>
                          updatePassenger(index, "lastName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) =>
                          updatePassenger(index, "dateOfBirth", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={passenger.nationality}
                        onChange={(e) =>
                          updatePassenger(index, "nationality", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="South African"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={passenger.passportNumber}
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            "passportNumber",
                            e.target.value,
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="A12345678"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

              {/* Flight Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {dictionaries.carriers[outbound.segments[0].carrierCode]}
                    </div>
                    <div className="text-sm text-gray-600">
                      {outbound.segments[0].departure.iataCode} →{" "}
                      {
                        outbound.segments[outbound.segments.length - 1].arrival
                          .iataCode
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {new Date(searchParams.departureDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                    {searchParams.returnDate && (
                      <div className="text-sm text-gray-600">
                        Return:{" "}
                        {new Date(searchParams.returnDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm">
                      {searchParams.adults} Adult
                      {searchParams.adults > 1 ? "s" : ""}
                      {searchParams.children > 0 &&
                        `, ${searchParams.children} Child${searchParams.children > 1 ? "ren" : ""}`}
                      {searchParams.infants > 0 &&
                        `, ${searchParams.infants} Infant${searchParams.infants > 1 ? "s" : ""}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Flight Price</span>
                  <span className="font-semibold">
                    {formatPrice(
                      parseFloat(flight.price.total),
                      flight.price.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatPrice(
                        parseFloat(flight.price.total),
                        flight.price.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
